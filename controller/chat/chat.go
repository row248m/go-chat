package chat

import (
	"net/http"

	"row248/chat/lib/flight"

	"github.com/blue-jay/core/router"
	"row248/chat/middleware/ajaxChecker"
	"row248/chat/model/message"
	"strconv"
	"row248/chat/lib/ajax"
	"math"
	"row248/chat/controller/chat/ws"
	"github.com/nu7hatch/gouuid"
	"os"
	"github.com/o1egl/govatar"
)

var hub *ws.Hub

// Load the routes.
func Load() {
	router.Get("/chat", Index)

	// ajax
	router.Post("/chat/ajax/selectMessages", SelectMessages, ajaxChecker.CheckXRequestedHeader)
	router.Post("/chat/ajax/addMessage", AddMessage, ajaxChecker.CheckXRequestedHeader)
	router.Post("/chat/ajax/getOnline", GetOnline, ajaxChecker.CheckXRequestedHeader)

	// ws
	hub = ws.NewHub()
	go hub.Run()

	router.Instance().HandleFunc("/chat/ws", func(w http.ResponseWriter, r *http.Request) {
		ws.ServerWS(hub, w, r)
	})
}

func Index(w http.ResponseWriter, r *http.Request) {
	c := flight.Context(w, r)

	generateUserIdIfNeeded(w, r)
	generateAvatarIfNeeded(w, r)

	tmpl := c.View.New("chat/index")
	tmpl.Vars["UserID"] = c.Sess.Values["UserID"]
	tmpl.Render(w, r)
}

func AddMessage(w http.ResponseWriter, r *http.Request) {
	c := flight.Context(w, r)

	text := r.FormValue("text")
	userId := c.Sess.Values["UserID"].(string)

	msg := message.Create(c.DB, userId, text)
	if msg.ID > 0 {
		ajax.ProcessResultSuccess(w)
		hub.SendNewMessageEvent(msg)
		return
	}
	ajax.ProcessResultFail(w)
}

func SelectMessages(w http.ResponseWriter, r *http.Request) {
	c := flight.Context(w, r)

	fromId, _ := strconv.ParseInt(r.FormValue("fromId"), 10, 64)
	limit, _ := strconv.ParseInt(r.FormValue("limit"), 10, 64)

	// first load
	if fromId == 0 {
		fromId = math.MaxInt64
	}

	messages, _ := message.SelectFromID(c.DB, fromId, limit)
	ajax.ProcessResultSuccessWithData(w, "messages", messages)
}

func GetOnline(w http.ResponseWriter, r *http.Request) {
	var response []string
	for _, client := range hub.Clients {
		isUnique := true
		for _, c := range response {
			if c == client.UserId {
				isUnique = false
			}
		}

		if isUnique {
			response = append(response, client.UserId)
		}
	}

	ajax.ProcessResultSuccessWithData(w, "users", response)
}

func generateUserIdIfNeeded(w http.ResponseWriter, r *http.Request) {
	c := flight.Context(w, r)

	userId := c.Sess.Values["UserID"]
	if userId == nil {
		uuid, _ := uuid.NewV4()
		c.Sess.Values["UserID"] = uuid.String()
		c.Sess.Save(r, w)
	}
}

func generateAvatarIfNeeded(w http.ResponseWriter, r *http.Request) {
	c := flight.Context(w, r)

	userId := c.Sess.Values["UserID"].(string)
	avatarPath := "asset/static/avatar/" + userId + ".jpg"

	_, err := os.Stat(avatarPath)
	if os.IsNotExist(err) {
		// Generate avatar
		// @todo: random FEMALE or MALE
		govatar.GenerateFile(govatar.FEMALE, avatarPath)
	}
}