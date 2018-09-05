package message

import (
	"database/sql"
	"github.com/jmoiron/sqlx"
	"time"
)

type Item struct {
	ID      int64  `db:"ID"`
	Message string `db:"Message"`
	UserID  string `db:"UserID"`
	IsSystem bool `db:"IsSystem"`
	CreatedDate time.Time `db:"CreatedDate"`
}

var (
	greetingMessage = "Зашел в чат"
	leavingMessage  = "Вышел из чата"
)

func Create(db *sqlx.DB, userId string, message string) Item {
	res, err := db.Exec("INSERT INTO message (Message, UserID, IsSystem, CreatedDate) VALUES (?, ?, 0, NOW())", message, userId)
	if err != nil {
		panic(err)
	}
	id, err := res.LastInsertId()
	if err != nil {
		return Item{ID: 0, Message: "", UserID: ""}
	}
	return Item{ID: id, Message: message, UserID: userId}
}

func SelectFromID(db *sqlx.DB, fromId int64, limit int64) ([]Item, error) {
	result := []Item{}
	err := db.Select(&result, "SELECT * FROM message WHERE ID < ? ORDER BY ID DESC LIMIT ?", fromId, limit)
	if err == sql.ErrNoRows {
		err = nil
	}
	return result, err
}

func CreateGreetingMessage(db *sqlx.DB, userId string) Item {
	res, err := db.Exec("INSERT INTO message (Message, UserID, IsSystem, CreatedDate) VALUES (?, ?, 1, NOW())", greetingMessage, userId)
	if err != nil {
		panic(err)
	}
	id, err := res.LastInsertId()
	if err != nil {
		return Item{ID: 0, Message: "", UserID: ""}
	}
	return Item{ID: id, Message: greetingMessage, UserID: userId, IsSystem: true, CreatedDate: time.Now()}
}

func CreateLeavingMessage(db *sqlx.DB, userId string) Item {
	res, err := db.Exec("INSERT INTO message (Message, UserID, IsSystem, CreatedDate) VALUES (?, ?, 1, NOW())", leavingMessage, userId)
	if err != nil {
		panic(err)
	}
	id, err := res.LastInsertId()
	if err != nil {
		return Item{ID: 0, Message: "", UserID: ""}
	}
	return Item{ID: id, Message: leavingMessage, UserID: userId, IsSystem: true, CreatedDate: time.Now()}
}
