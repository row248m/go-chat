// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package ws

import (
	"row248/chat/model/message"
	json2 "encoding/json"
	"row248/chat/lib/flight"
)

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Registered clients.
	Clients map[string]*Client

	// Inbound messages from the clients.
	Broadcast chan []byte

	// Register requests from the clients.
	register chan *ClientEvent

	// Unregister requests from clients.
	unregister chan *ClientEvent
}

func NewHub() *Hub {
	return &Hub{
		Broadcast:  make(chan []byte),
		register:   make(chan *ClientEvent),
		unregister: make(chan *ClientEvent),
		Clients:    make(map[string]*Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case clientEvent := <-h.register:
			if _, ok := h.Clients[clientEvent.client.UserId]; !ok {
				h.Clients[clientEvent.client.UserId] = clientEvent.client

				c := flight.Context(clientEvent.w, clientEvent.r)
				msg := message.CreateGreetingMessage(c.DB, clientEvent.client.UserId)

				// Send event about new user joined the chat
				go h.SendNewMessageEvent(msg)
				go h.SendOnlineChangedEvent()
			}
		case clientEvent := <-h.unregister:
			if _, ok := h.Clients[clientEvent.client.UserId]; ok {
				delete(h.Clients, clientEvent.client.UserId)
				close(clientEvent.client.send)

				c := flight.Context(clientEvent.w, clientEvent.r)
				msg := message.CreateLeavingMessage(c.DB, clientEvent.client.UserId)

				// Send event about user leaving the chat
				go h.SendNewMessageEvent(msg)
				go h.SendOnlineChangedEvent()
			}
		case message := <-h.Broadcast:
			for _, client := range h.Clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.Clients, client.UserId)
				}
			}
		}
	}
}

// Send new message for all clients
func (h *Hub) SendNewMessageEvent(newMessage message.Item) {
	data := map[string]interface{}{}

	data["event"] = "newMessage"
	data["data"] = newMessage

	json, _ := json2.Marshal(data)
	h.Broadcast <- json
}

// Send event about online changed
func (h *Hub) SendOnlineChangedEvent() {
	data := map[string]interface{}{}

	data["event"] = "onlineChanged"

	json, _ := json2.Marshal(data)
	h.Broadcast <- json
}