const { UserInputError } = require('apollo-server')
const { loadPolicy } = require("@open-policy-agent/opa-wasm");
const fs = require('fs');

const load = async (filename, data) => {
  const policyWasm = fs.readFileSync(filename);
  const policy = await loadPolicy(policyWasm)
  try {
    policy.setData(data);
  } catch(err) {
      console.log("ERROR: ", err);
      process.exit(1);
  };
  return policy;
}

let policy

const initPolicy = async (filename, data) => {
  if(policy == null) {
    policy = await load(filename, data);
  }
  return policy
}

const graphqlOPAAuthorizer = (filename, data) => (async (resolve, root, args, context, info) => {
  policy = await initPolicy(filename, data)
  console.log(`Auth middleware INPUT (args: ${JSON.stringify(args)}, fieldName: ${info.fieldName}, parentType: ${info.parentType})`)
  const result = policy.evaluate({
    "object": root || "",
    "args": args,
    "fieldName": info.fieldName,
    "parentType": info.parentType,
    "who": context.user,
  });
  console.log(`Auth middleware OUTPUT (result: ${JSON.stringify(result)})`)
  if(!result[0].result) {
    throw new UserInputError('Forbidden', {});
    // return null
  }
  return await resolve(root, args, context, info)
})

const logOriginalUrl = (req, res, next) => {
  console.log(`Auth middleware INPUT (path: ${req.path}, Request Type: ${req.method}, Request paremeters: ${JSON.stringify(req.params)}, route: ${JSON.stringify(req.route)}}`)
  next()
}

const expressAuth = (filename, dataSettings) => (
  async (req, res, next) => {
    policy = await initPolicy(filename, dataSettings)
    const result = policy.evaluate({
      "args": req.params,
      "path": req.path,
      "pathPattern": req.route.path,
      "method": req.method,
      "who": req.headers.authorization,
    });
    console.log(`Auth middleware OUTPUT (result: ${JSON.stringify(result)})`)
    if(result[0].result) {
      next()
    } else {
      return res.status(403).json({
        status: 403,
        message: 'FORBIDDEN'
      })
    }
  }
)

const restExpressOPAAuthorizer = (filename, dataSettings) => [logOriginalUrl, expressAuth(filename, dataSettings)]

module.exports = { graphqlOPAAuthorizer, restExpressOPAAuthorizer }