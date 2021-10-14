// import { envelop } from '@envelop/core';
// import { useOperationFieldPermissions } from '@envelop/operation-field-permissions';
import { useGenericAuth, ResolveUserFn, ValidateUserFn } from '@envelop/generic-auth';
import { Plugin } from '@envelop/types';
import { ValidationRule, OperationTypeNode, GraphQLError } from 'graphql';
import { useExtendedValidation } from '@envelop/extended-validation';
import {
  GraphQLType,
  GraphQLList,
  GraphQLNonNull,
  isUnionType,
  FieldNode,
  GraphQLObjectType,
  isObjectType,
  isInterfaceType,
} from 'graphql';
import { PassThrough } from 'stream';


type UserType = {
  id: string;
};

var user

const resolveUserFn: ResolveUserFn<UserType> = context => {
  try {
    user = context.req['headers'].authorization;

    return user;
  } catch (e) {
    console.error('Failed to validate token');

    return null;
  }
};

const validateUser: ValidateUserFn<UserType> = async (user, context) => {
  if (!user) {
    throw new Error(`Unauthenticated!`);
  }
};

export const useOPAAuth = () => useGenericAuth({
      resolveUserFn,
      validateUser,
      mode: 'protect-all',
    });


export const createFilterOperationTypeRule = (authorizer): ValidationRule => (context) => {
  const handleField = (node: FieldNode, objectType: GraphQLObjectType) => {
    try {
      console.log(JSON.stringify(context, null, 2));
      authorizer(context, objectType.name, node.name.value, node.arguments, user);
    } catch(e) {
      context.reportError(e);
    }
  };

  return {
    Field(node) {
      const parentType = context.getParentType();
      if (parentType) {
        const wrappedType = getWrappedType(parentType);
        if (isObjectType(wrappedType)) {
          handleField(node, wrappedType);
        } else if (isUnionType(wrappedType)) {
          for (const objectType of wrappedType.getTypes()) {
            handleField(node, objectType);
          }
        }
      }
    }
  };
};

const getWrappedType = (graphqlType: GraphQLType): Exclude<GraphQLType, GraphQLList<any> | GraphQLNonNull<any>> => {
  if (graphqlType instanceof GraphQLList || graphqlType instanceof GraphQLNonNull) {
    return getWrappedType(graphqlType.ofType);
  }
  return graphqlType;
};

export const useFilterAllowedOperations = (authorizer): Plugin => {
  return {
    onPluginInit({ addPlugin }) {
      addPlugin(
        useExtendedValidation({
          rules: [
            createFilterOperationTypeRule(authorizer)
          ],
        })
      );
    }
  };
};

