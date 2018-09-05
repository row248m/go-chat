// Package static serves static files like CSS, JavaScript, and images.
package static

import (
	"net/http"
	"os"
	"path"

	"row248/chat/lib/flight"

	"github.com/blue-jay/core/router"
)

// Load the routes.
func Load() {
	// Serve static files
	router.Get("/static/*filepath", Index)
}

// Index maps static files.
func Index(w http.ResponseWriter, r *http.Request) {
	c := flight.Context(w, r)

	// File path
	path := path.Join(c.Config.Asset.Folder, r.URL.Path[1:])

	// Only serve files
	if fi, err := os.Stat(path); err == nil && !fi.IsDir() {
		http.ServeFile(w, r, path)
		return
	}

	w.WriteHeader(http.StatusNotFound)
}