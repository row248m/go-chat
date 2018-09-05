package include

import (
	"html/template"
	"io/ioutil"
	"log"
)

func Map() template.FuncMap {
	f := make(template.FuncMap)

	f["IncludeHTML"] = func(path string) template.HTML {
		b, err := ioutil.ReadFile(path)
		if err != nil {
			log.Println("includeHTML - error reading file: %v", err)
			return ""
		}

		return template.HTML(string(b))
	}

	return f
}