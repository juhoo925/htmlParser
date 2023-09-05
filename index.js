

exports.parse = parse;
exports.getStyleFromString = getStyleFromString;
exports.getChildrenObj = getChildrenObj;

var _lexer = require('./lexer');

var _lexer2 = _interopRequire(_lexer);

var _parser = require('./parser');

var _parser2 = _interopRequire(_parser);

var _format = require('./format');

var _tags = require('./tags');

function _interopRequire(obj) { return obj; }

var parseDefaults = exports.parseDefaults = {
  voidTags: _tags.voidTags,
  closingTags: _tags.closingTags,
  childlessTags: _tags.childlessTags,
  closingTagAncestorBreakers: _tags.closingTagAncestorBreakers,
  includePositions: false
};

function parse(str) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : parseDefaults;

  var tokens = (0, _lexer2.default)(str, options);
  var nodes = (0, _parser2.default)(tokens, options);
  return (0, _format.format)(nodes, options);
}

function getFirstUppercaseString(string){
  return string[0].toUpperCase() + string.slice(1).toLowerCase();
}

function getStyleFromString(styleStr) {
  let styleArr = styleStr.split(';');
  var styleObj = {};
  styleArr.forEach(styleobj => {
      let arrItem = styleobj.split(':');
      let arrStyleName = arrItem[0].split('-');
      var styleName = '';
      if ( arrStyleName.length == 2 ) {                                        
          const arr1 = getFirstUppercaseString(arrStyleName[1]);
          styleName = arrStyleName[0] + arr1;
      }
      else {
          styleName = arrStyleName[0];
      }
      styleName = styleName.replaceAll(' ', '');
      styleObj[styleName] = arrItem[1].replaceAll(' ', '');
  });
  return styleObj;
}

function getChildrenObj(parentObj, childList) {
  var childArray = [];    
  childList.forEach(obj => {
      if ( obj.type == 'text' ) {
          var text = obj.content.replaceAll('\r\n', '');
          text = text.replaceAll('    ', '');
          if ( text.length > 0 ) {
              parentObj['text'] = text;
          }            
      }
      else if ( obj.type == 'element' ) {
          var childObj = {};
          Object.entries(obj).forEach(([key, value]) => {
              if ( key == 'tagName' ) {
                  childObj['tag'] = value;
              }
              else if ( key == 'attributes' ) {
                  var attrArray = value;
                  attrArray.forEach(attrObj => {                          
                      if ( attrObj.key == 'id' ) {
                          childObj['id'] = attrObj.value;                                    
                      }
                      else if ( attrObj.key == 'class' ) {
                          childObj['class'] = attrObj.value;
                      }
                      else if ( attrObj.key == 'style' ) {
                          let styleObj = getStyleFromString(attrObj.value);
                          childObj['style'] = styleObj;
                      }
                  });
              }
              else if ( key == 'children' ) {
                  let childJson = getChildrenObj(childObj, value);
                  if ( childJson.length > 0 ) {
                      childObj['children'] = childJson;
                  }
              }  
          });
          childArray.push(childObj);
      }
  });
  return childArray;
}

