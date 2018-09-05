// Package boot handles the initialization of the web components.
package boot

import (
	"log"

	"row248/chat/controller"
	"row248/chat/lib/env"
	"row248/chat/lib/flight"
	"row248/chat/viewfunc/link"
	"row248/chat/viewfunc/noescape"
	"row248/chat/viewfunc/prettytime"
	"row248/chat/viewmodify/authlevel"
	"row248/chat/viewmodify/uri"

	"github.com/blue-jay/core/form"
	"github.com/blue-jay/core/pagination"
	"row248/chat/viewfunc/include"
)

// RegisterServices sets up all the web components.
func RegisterServices(config *env.Info) {
	// Set up the session cookie store
	err := config.Session.SetupConfig()
	if err != nil {
		log.Fatal(err)
	}

	// Connect to the MySQL database
	mysqlDB, err := config.MySQL.Connect(true)
	if err != nil {
		log.Fatal(err)
	}

	// Load the controller routes
	controller.LoadRoutes()

	// Set up the views
	config.View.SetTemplates(config.Template.Root, config.Template.Children)

	// Set up the functions for the views
	config.View.SetFuncMaps(
		config.Asset.Map(config.View.BaseURI),
		link.Map(config.View.BaseURI),
		noescape.Map(),
		prettytime.Map(),
		form.Map(),
		pagination.Map(),
		include.Map(),
	)

	// Set up the variables and modifiers for the views
	config.View.SetModifiers(
		authlevel.Modify,
		uri.Modify,
	)

	// Store the variables in flight
	flight.StoreConfig(*config)

	// Store the database connection in flight
	flight.StoreDB(mysqlDB)
}
