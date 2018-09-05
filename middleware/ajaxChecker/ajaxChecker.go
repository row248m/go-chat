package ajaxChecker

import (
	"net/http"
	"row248/chat/lib/flight"
)

func CheckXRequestedHeader(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		c := flight.Context(w, r)

		var _, exists = c.R.Header["X-Requested-With"]
		if !exists {
			w.WriteHeader(http.StatusForbidden)
			return
		}

		h.ServeHTTP(w, r)
	})
}
