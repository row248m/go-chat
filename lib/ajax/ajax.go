package ajax

import (
	"net/http"
	"encoding/json"
)

var (
	resultSucess = "success"
	resultFail = "fail"
)

func ProcessResultSuccessWithData(w http.ResponseWriter, key string, result interface{}) {
	response := map[string]interface{}{}
	response["result"] = resultSucess;
	response[key] = result

	responseJson, _ := json.Marshal(response)
	w.Write(responseJson)
}

func ProcessResultSuccess(w http.ResponseWriter) {
	response := map[string]interface{}{}
	response["result"] = resultSucess;

	responseJson, _ := json.Marshal(response)
	w.Write(responseJson)
}

func ProcessResultFail(w http.ResponseWriter) {
	response := map[string]interface{}{}
	response["result"] = resultFail;

	responseJson, _ := json.Marshal(response)
	w.Write(responseJson)
}