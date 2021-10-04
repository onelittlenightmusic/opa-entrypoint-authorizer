package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	auth "github.com/onelittlenightmusic/opa-entrypoint-authorizer"
)

type User struct {
    Name string
    Age int
}

type UserName struct {
    Name string
}

type UserAge struct {
    Age int
}

type Office struct {
    Name string
    Floor int
}

type Args map[string]string

type Entrypoint func(Args)(interface{})

var (
    Users []User
    Offices []Office
)
func homePage(w http.ResponseWriter, r *http.Request){
    fmt.Fprintf(w, "Welcome to the HomePage!")
    fmt.Println("Endpoint Hit: homePage")
}

func createEntrypoint(h Entrypoint) func(w http.ResponseWriter, r *http.Request)() {
    return func(w http.ResponseWriter, r *http.Request) {
        log.Printf("Header: %s\n", r.Header)
        w.Header().Set("Content-Type", "application/json; charset=UTF-8")
        w.WriteHeader(http.StatusOK)
        vars := mux.Vars(r)
        value := h(vars)
        if value == nil {
            w.WriteHeader(400)
			w.Write([]byte("Bad request"))
			return
        }
        json.NewEncoder(w).Encode(value)
    }
}

func getUserNameList() []UserName {
    var nameList []UserName
    for _, u := range Users {
        nameList = append(nameList, UserName{Name: u.Name})
    }
    return nameList
}


func handleRequests(middleware func(h http.Handler)(http.Handler)) {
    myRouter := mux.NewRouter().StrictSlash(true)
    myRouter.Use(middleware)
    myRouter.HandleFunc("/", homePage)
    myRouter.HandleFunc("/users", createEntrypoint(func(_ Args)interface{}{return getUserNameList()}))
    myRouter.HandleFunc("/offices", createEntrypoint(func(_ Args)interface{}{return Offices}))
    myRouter.HandleFunc("/users/{user_name}", createEntrypoint(func(args Args)interface{}{
        for _, u := range getUserNameList() {
            if u.Name == args["user_name"] {
                return u
            }
        }
        return nil
    }))
    myRouter.HandleFunc("/users/{user_name}/age", createEntrypoint(func(args Args)interface{}{
        for _, u := range Users {
            if u.Name == args["user_name"] {
                return UserAge{Age: u.Age}
            }
        }
        return nil
    }))
    log.Fatal(http.ListenAndServe(":8081", myRouter))
}

func main() {

    config := auth.MiddlewareConfiguration {
        DataPath: "./data",
        BundlePath: "../../bundle-raw.tar.gz",
    }
    middleware := auth.CreateRestMiddleware(config)

    Offices = []Office{
        {Name: "santa clara", Floor: 5},
    }
    Users = []User{
        {Name: "alice", Age: 50},
        {Name: "bob", Age: 30},
        {Name: "chris", Age: 20},
    }
    handleRequests(middleware)
}