// 除default外别的都是走H5不加载的，只需要一个页多个楼层即可
const app = getApp();
import {
  Floor
} from './define.js';
var strFloor = "floor";
var strAct = "actId";
var strActName = "actName";
var strPage = "dtPage";
//专有
var strColor = "color";
var strRadius = "radius";
var strIcon = "icon";
var strGrav = "gravPnt";
var detailCallout = {
  content: "查看详情",
  fontSize: 14,
  color: "#FFFFFF",
  bgColor: "#009968",
  borderWidth: 1,
  padding: 4,
  display: "ALWAYS",
  textAlign: "center"
};
var markerCallout = {
  content: "",
  fontSize: 14,
  bgColor: "#FFF",
  borderColor: "#009968",
  borderWidth: 1,
  padding: 4,
  display: "BYCLICK",
  // display: "ALWAYS",
  textAlign: "center"
};
var addMarkerFunction = function(currentFloor, id, lat, lng, icon, callout) {
  if (callout == null)
    app.globalData.floors[currentFloor].Markers.push({
      id: currentMarkerId,
      latitude: lat,
      longitude: lng,
      iconPath: icon,
      width: 40,
      height: 40
    });
  else
    app.globalData.floors[currentFloor].Markers.push({
      id: currentMarkerId,
      latitude: lat,
      longitude: lng,
      iconPath: icon,
      width: 40,
      height: 40,
      callout: callout
    });
  app.globalData.markerValue[currentMarkerId++] = id;
}
var currentMarkerId = 0;


function ReadJsonToGeoPage() {
  
  /*
  var strJSON = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[120.20228505134583,30.162713265422347],[120.20042359828949,30.162170607819075],[120.20026803016663,30.162073207420292],[120.2002090215683,30.161929425703352],[120.2004987001419,30.161516631867002],[120.20164668560028,30.16046840604437],[120.20301461219788,30.16084873705579],[120.20305216312408,30.160932224154607],[120.20252108573914,30.162527741791454],[120.20242989063263,30.162620503650537],[120.20228505134583,30.162713265422347]]]},\"properties\":{\"color\":\"#32CD33\",\"gravPnt\":{\"lat\":30.161590835733357,\"lng\":120.20163059234619},\"floor\":\"1\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[120.20244061946869,30.16252310369619],[120.20195245742798,30.162388598839144],[120.20209729671478,30.16211031234546],[120.20256400108337,30.162235541364822],[120.20244061946869,30.16252310369619]]]},\"properties\":{\"color\":\"#87CEFA\",\"gravPnt\":{\"lat\":30.162316708020825,\"lng\":120.20225822925568},\"floor\":\"1\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[120.20245671272278,30.162527741791454],[120.20188271999359,30.162407151244135],[120.2022260427475,30.162147417256662],[120.2025854587555,30.162203074597304],[120.20245671272278,30.162527741791454]]]},\"properties\":{\"color\":\"#CE5C5C\",\"gravPnt\":{\"lat\":30.162337579524056,\"lng\":120.20223408937454},\"actId\":1,\"actName\":\"表演\",\"floor\":\"1\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[120.20203828811646,30.160867289750517],[120.20214557647705,30.16065393355027],[120.20259618759155,30.160779164419417],[120.20255863666534,30.160918309643026],[120.20236015319824,30.160871927923637],[120.202317237854,30.161001796682964],[120.20250499248505,30.16106209283447],[120.20246744155884,30.16113630343191],[120.20199000835419,30.16101571118274],[120.20203828811646,30.160867289750517]]]},\"properties\":{\"color\":\"#CE5C5C\",\"gravPnt\":{\"lat\":30.16089511849109,\"lng\":120.20229309797287},\"dtPage\":\"B馆详情\",\"floor\":\"1\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[120.20179152488708,30.161326467832833]},\"properties\":{\"color\":\"#CE5C5C\",\"radius\":34.19015683486428,\"floor\":\"1\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"MultiLineString\",\"coordinates\":[[[120.20314872264862,30.160987882181207],[120.20229578018188,30.160793078950615],[120.20180225372314,30.16121515213046],[120.20218849182129,30.161720709934677],[120.20252645015717,30.16201755000634],[120.20242989063263,30.162370046430667],[120.20167350769043,30.162226265146614],[120.20166277885437,30.16223090325582]]]},\"properties\":{\"color\":\"#2691EA\",\"gravPnt\":{\"lat\":30.161581562690642,\"lng\":120.2024057507515},\"floor\":\"1\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Marker\",\"coordinates\":[120.20152866840363,30.161080645489072]},\"properties\":{\"icon\":\"img/icons/icon4.png\",\"floor\":\"1\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Marker\",\"coordinates\":[120.20195782184601,30.160779164419417]},\"properties\":{\"icon\":\"img/icons/icon4.png\",\"floor\":\"1\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Marker\",\"coordinates\":[120.20140528678894,30.161372849338413]},\"properties\":{\"icon\":\"img/icons/icon6.png\",\"floor\":\"1\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Marker\",\"coordinates\":[120.20241379737854,30.16201755000634]},\"properties\":{\"icon\":\"img/icons/icon2.png\",\"floor\":\"1\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Marker\",\"coordinates\":[120.20197927951813,30.162212350817676]},\"properties\":{\"icon\":\"img/icons/icon3.png\",\"floor\":\"1\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Marker\",\"coordinates\":[120.20300924777985,30.1609847724588]},\"properties\":{\"icon\":\"img/icons/icon5.png\",\"floor\":\"1\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Marker\",\"coordinates\":[120.20261228084564,30.160831712805212]},\"properties\":{\"icon\":\"img/icons/icon5.png\",\"floor\":\"1\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Marker\",\"coordinates\":[120.20233869552612,30.162325193818717]},\"properties\":{\"icon\":\"img/icons/icon5.png\",\"floor\":\"1\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Marker\",\"coordinates\":[120.20163059234619,30.162250984116135]},\"properties\":{\"icon\":\"img/icons/icon1.png\",\"floor\":\"1\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Point\",\"coordinates\":[120.2024245262146,30.161507334490985]},\"properties\":{\"color\":\"#CE5C5C\",\"radius\":12.08663419266007,\"floor\":\"2\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[120.20213484764099,30.16152124891941],[120.20245134830475,30.16152124891941],[120.20245134830475,30.161280065215216],[120.20213484764099,30.161280065215216],[120.20213484764099,30.16152124891941]]]},\"properties\":{\"color\":\"#CE5C5C\",\"gravPnt\":{\"lat\":30.16140065706731,\"lng\":120.20229309797287},\"floor\":\"5\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[120.20255327224731,30.161535163345878],[120.20280003547668,30.161535163345878],[120.20280003547668,30.161377466397536],[120.20255327224731,30.161377466397536],[120.20255327224731,30.161535163345878]]]},\"properties\":{\"color\":\"#CE5C5C\",\"gravPnt\":{\"lat\":30.161456314871707,\"lng\":120.202676653862},\"floor\":\"6\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[120.2025693655014,30.161368190098592],[120.20285904407501,30.161368190098592],[120.20285904407501,30.16128934152243],[120.2025693655014,30.16128934152243],[120.2025693655014,30.161368190098592]]]},\"properties\":{\"color\":\"#CE5C5C\",\"gravPnt\":{\"lat\":30.16132876581051,\"lng\":120.20271420478821},\"floor\":\"7\"}},{\"type\":\"Feature\",\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[120.20259618759155,30.161405295289097],[120.20286977291107,30.161405295289097],[120.20286977291107,30.16129397967573],[120.20259618759155,30.16129397967573],[120.20259618759155,30.161405295289097]]]},\"properties\":{\"color\":\"#CE5C5C\",\"gravPnt\":{\"lat\":30.161349637482413,\"lng\":120.20273298025131},\"floor\":\"8\"}}],\"bounds\":[{\"lat\":30.162713265422347,\"lng\":120.20314872264862},{\"lat\":30.16046840604437,\"lng\":120.2002090215683}],\"initialPnt\":{\"lat\":30.161590835733357,\"lng\":120.20167887210846}}"; 
  */

  
  var strJSON = getApp().globalData.map;
  console.log(strJSON);
  console.log(typeof(strJSON));

  
  strJSON = JSON.stringify(strJSON);
  console.log(strJSON);
  console.log(typeof(strJSON));
  app.globalData.floors={};

  //TODO: request
  if (strJSON != "") {
    //var geoStorageObj = strJSON;
    var geoStorageObj = JSON.parse(strJSON);
    console.log(geoStorageObj);
    if (geoStorageObj !== null)
      geoStorageObj.features.forEach(function(feature) {
        var currentFloor = feature.properties[strFloor].toString();
        var hasPage = feature.properties[strPage];
        if (app.globalData.floors[currentFloor] == undefined)
          app.globalData.floors[currentFloor] = new Floor();
        if (feature.geometry.type == "Point") { ////////实际是圆,必画
          app.globalData.floors[currentFloor].Circles.push({
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0],
            color: feature.properties[strColor],
            fillColor: feature.properties[strColor] + "4c",
            radius: feature.properties[strRadius],
            strokeWidth: 1
          });
        } else if (feature.geometry.type == "Polygon" || feature.geometry.type == "MultiLineString") { /////必画
          var points = [];
          feature.geometry.coordinates[0].forEach(function(geopnt) {
            points.push({
              latitude: geopnt[1],
              longitude: geopnt[0]
            });
          });
          if (feature.geometry.type == "Polygon")
            app.globalData.floors[currentFloor].Polygons.push({
              points: points,
              strokeWidth: 1,
              strokeColor: feature.properties[strColor],
              fillColor: feature.properties[strColor] + "4c"
            });
          else
            app.globalData.floors[currentFloor].Polylines.push({
              points: points,
              arrowLine: true,
              color: feature.properties[strColor],
              width: 2
            });
        }
        // var addMarkerFunction = function (currentFloor, id, lat, lng, icon, callout)
        markerCallout.content = feature.properties[strActName];
        if (feature.properties[strPage] != undefined) { // 优先级：详情页高于所有
          if (feature.geometry.type == "Point") {
            addMarkerFunction(currentFloor, feature.properties[strPage], feature.geometry.coordinates[1], feature.geometry.coordinates[0], '../../images/DotWithPage.png', copyobj(detailCallout));
          }
          else {
            addMarkerFunction(currentFloor, feature.properties[strPage], feature.properties[strGrav].lat, feature.properties[strGrav].lng, '../../images/DotWithPage.png', copyobj(detailCallout));
          }
        } else if (feature.properties[strAct] != undefined && feature.geometry.type == "Point") { //圆上的额外Marker表示活动
          addMarkerFunction(currentFloor, feature.properties[strAct], feature.geometry.coordinates[1], feature.geometry.coordinates[0], '../../images/DotOnly.png', copyobj(markerCallout));
        } else if (feature.properties[strAct] != undefined && feature.geometry.type == "Polygon") { //多边形上的额外Marker表示活动
          addMarkerFunction(currentFloor, feature.properties[strAct], feature.properties[strGrav].lat, feature.properties[strGrav].lng, '../../images/DotOnly.png', copyobj(markerCallout));
        } else if (feature.properties[strAct] != undefined && feature.geometry.type == "Marker") { //Marker表示活动
          addMarkerFunction(currentFloor, feature.properties[strAct], feature.geometry.coordinates[1], feature.geometry.coordinates[0], '../../images' + feature.properties[strIcon].substring(3), copyobj(markerCallout));
        } else if (feature.geometry.type == "Marker") {
          addMarkerFunction(currentFloor, -1, feature.geometry.coordinates[1], feature.geometry.coordinates[0], '../../images' + feature.properties[strIcon].substring(3), null);
        }
      });
  }
  app.globalData.currentFloor = '1';
  // 注：marker若为[]，地图渲染bug，所以这里添加占位符
  addMarkerFunction('1', -1, geoStorageObj.initialPnt.lat, geoStorageObj.initialPnt.lng, '../../images/null.png', null);
};

function copyobj(a) {
  var c = {};
  c = JSON.parse(JSON.stringify(a));
  return c;
}
module.exports = {
  ReadJsonToGeoPage: ReadJsonToGeoPage
}