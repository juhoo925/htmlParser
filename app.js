
var htmlparse = require('./index');
var json_stringify = require('json-stringify');
var fs = require('fs');
var path = require('path');

const prompt = require('prompt');
prompt.start();
prompt.get(['input_file', 'output_file'], function (err, result) {
    if (err) { return console.log(err); }
    let input_path = path.join(__dirname, result.input_file);
    let output_path = path.join(__dirname, result.output_file);
    fs.readFile(input_path, {encoding: 'utf-8'}, function(err,data){
        if (!err) {
            let html = htmlparse.parse(data.toString());
            let jsonStr = json_stringify(html);
            let jsonData = JSON.parse(jsonStr);
            var jsonArray = [];            
            jsonData.forEach(obj => {
                var jsonObj = {};
                Object.entries(obj).forEach(([key, value]) => {
                    if ( key == 'tagName' ) {
                        jsonObj['tag'] = value;
                    }
                    else if ( key == 'attributes' ) {
                        var attrArray = value;
                        attrArray.forEach(attrObj => {                          
                            if ( attrObj.key == 'id' ) {
                                jsonObj['id'] = attrObj.value;                                    
                            }
                            else if ( attrObj.key == 'class' ) {
                                jsonObj['class'] = attrObj.value;
                            }
                            else if ( attrObj.key == 'style' ) {
                                let styleObj = htmlparse.getStyleFromString(attrObj.value);
                                jsonObj['style'] = styleObj;
                            }
                        });
                    }
                    else if ( key == 'children' ) {
                        let childJson = htmlparse.getChildrenObj(jsonObj, value);
                        if ( childJson.length > 0 ) {
                            jsonObj['children'] = childJson;
                        }
                    }  
                }); 
                jsonArray.push(jsonObj);
            });
            fs.writeFileSync(output_path, json_stringify(jsonArray, null, 2));
        } else {
            console.log(err);
        }
    });
});
