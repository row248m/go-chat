// Package controller loads the routes for each of the controllers.
package controller

import (
	"row248/chat/controller/chat"
	"row248/chat/controller/static"
)

// LoadRoutes loads the routes for each of the controllers.
func LoadRoutes() {
	chat.Load()
	static.Load()

	//fs := http.FileServer(http.Dir("asset/static"))
	//http.Handle("/static/", http.StripPrefix("/static/", fs))
}
