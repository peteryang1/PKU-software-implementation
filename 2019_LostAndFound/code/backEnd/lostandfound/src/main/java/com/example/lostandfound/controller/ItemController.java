package com.example.lostandfound.controller;

import com.example.lostandfound.mapper.CollectionMapper;
import com.example.lostandfound.mapper.ItemMapper;
import com.example.lostandfound.mapper.UserTableMapper;
import com.example.lostandfound.model.Collection;
import com.example.lostandfound.model.Item;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.lostandfound.model.*;
import javax.servlet.http.HttpServletRequest;
import java.awt.geom.Point2D;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.*;
import java.text.SimpleDateFormat;

@RestController
@RequestMapping(value = "/item", produces = "application/json;charset=UTF-8")
public class ItemController {

    @Autowired
    private ItemMapper itemMapper;
    @Autowired
    private UserTableMapper userTableMapper;
    @Autowired
    private CollectionMapper collectionMapper;
    @Autowired
    HttpServletRequest request;

    //发布启事 type=post
    @PostMapping(value = "putItemInfo")
    public Object putItemInfo(int type, String title, String label, String content, String place, String datetime, double longitude, double latitude) {
        System.out.println("here the params:"+content);
        String userid = request.getSession().getAttribute("userid").toString();
        Map<String, Object> map = new HashMap<>();
        String maxId = itemMapper.getMaxId();
        Integer id = 1;
        if(maxId!=null) id = Integer.valueOf(maxId)+1;
        //String id = UUID.randomUUID().toString().replaceAll("-","");
        //System.out.println(id);
        Item item = new Item();
        item.setItemid(id);
        item.setItemtype(type);
        item.setTitle(title);
        item.setPlace(place);
        item.setDatetime(datetime);
        item.setCategory(label);
        item.setContent(content);
        item.setLatitude(String.valueOf(latitude));
        item.setLongitude(String.valueOf(longitude));
        item.setCreateuserid(Integer.valueOf(userid));
        Date date = new Date();
        //SimpleDateFormat dateFormat= new SimpleDateFormat("yyyy-MM-dd :hh:mm:ss");
        //System.out.println(dateFormat.format(date));
        item.setCreatedatetime(date);
        item.setFlag(1);
        int i = itemMapper.insert(item);
        if(i==1){
            map.put("status", 1);
            map.put("itemId", id);
        }else {
            map.put("status", 2);
            map.put("msg", "插入失败！");
            map.put("itemId", null);
        }
        return map;
    }

    @RequestMapping("/getItemInfo")
    public Object getItemInfo(int itemId) {
        Map<String, Object> map = new HashMap<>();
        Item item = itemMapper.selectByPrimaryKey(itemId);
        if(item == null) {
            map.put("status", 2);
            map.put("msg", "不存在");
            return map;
        }else {
            //除item各属性外，添加发布人姓名信息
            String username = userTableMapper.getUsername(item.getCreateuserid());
            /*Map<String,Object> result= new HashMap<>();
            result.put("itemid",item.getItemid());
            result.put("createuserid",item.getCreateuserid());
            result.put("createusername",username);
            result.put("title",item.getTitle());
            result.put("content",item.getContent());
            result.put("itemtype",item.getItemtype());*/

            map.put("status", 1);
            map.put("msg", "");
            map.put("itemInfo", item);
            map.put("createusername",username);
            return map;
        }
    }

    @RequestMapping("/getNearItems")
    public Object getNearItems(double longitude, double latitude, int range, String category, int type, int num) {
        Map<String, Object> map = new HashMap<>();
        List<Item> itemList;
        //物品类型不限时
        if(type==0 && category.equals("不限")){
            System.out.println("111");
            itemList = itemMapper.selectAllItem();
        }else if(type==0){
            System.out.println("222");
            itemList = itemMapper.selectAllItemByC(category);
        }
        else if(category.equals("不限")){
            System.out.println("333");
            itemList = itemMapper.selectAllItemByT(type);
        }else {
            System.out.println("444");
            itemList = itemMapper.selectAllItemByTAndC(type,category);
        }
        System.out.println(itemList.size()+"个");
        List<Item> NearItemList = new ArrayList<>();
        List<Double> distanceList = new ArrayList<>();
        //for(Item item : itemList){
        for(int i=0;i<10;i++){
            Item item = itemList.get(i);
            //计算距离
            Point2D pointUser = new Point2D.Double(longitude,latitude);
            Point2D pointItem = new Point2D.Double(Double.valueOf(item.getLongitude()),Double.valueOf(item.getLatitude()));
            double distance = getDistance(pointUser,pointItem);
            //System.out.println("distance item "+item.getTitle()+": "+distance);
            //放入NearItemlist时进行排序，从近到远
            //根据distance进行排序，取最近的前num个
            if(distance < range && NearItemList.size()<num) {
                if(NearItemList.size()<1){//集合为空时插入第一个元素
                    NearItemList.add(item);
                    distanceList.add(distance);
                }else {
                    //集合已有元素时，将新item插入至第一个大于已有元素的位置
                    int index=0;
                    while (index<distanceList.size() && distance>distanceList.get(index)){
                        index++;
                    }
                    NearItemList.add(index,item);
                    distanceList.add(index,distance);
                }
            }else {
                break;
            }
        }
        if(NearItemList.isEmpty()) {
            map.put("status", 2);
            map.put("msg", "没有数据");
        }else {
            map.put("status", 1);
            map.put("msg", "获取成功");
            map.put("itemInfo", NearItemList);
        }

        return map;
    }

    private static final double EARTH_RADIUS = 6371393;
    // 平均半径,单位：m
    /**
     * 通过AB点经纬度获取距离
     * @param pointA A点(经，纬)
     * @param pointB B点(经，纬)
     * @return 距离(单位：米)     */
    public static double getDistance(Point2D pointA, Point2D pointB) {
        // 经纬度（角度）转弧度。弧度用作参数，以调用Math.cos和Math.sin
        double radiansAX = Math.toRadians(pointA.getX()); // A经弧度
        double radiansAY = Math.toRadians(pointA.getY()); // A纬弧度
        double radiansBX = Math.toRadians(pointB.getX()); // B经弧度
        double radiansBY = Math.toRadians(pointB.getY()); // B纬弧度
        //公式中“cosβ1cosβ2cos（α1-α2）+sinβ1sinβ2”的部分，得到∠AOB的cos值
        double cos = Math.cos(radiansAY) * Math.cos(radiansBY) * Math.cos(radiansAX - radiansBX)
                + Math.sin(radiansAY) * Math.sin(radiansBY);
        //System.out.println("cos = " + cos); // 值域[-1,1]
        double acos = Math.acos(cos); // 反余弦值
        //System.out.println("acos = " + acos); // 值域[0,π]
        //System.out.println("∠AOB = " + Math.toDegrees(acos)); // 球心角 值域[0,180]
        return EARTH_RADIUS * acos; // 最终结果

    }


    @PostMapping("/deleteItem")
    public Object deleteItem(int itemId) {
        itemMapper.deleteByPrimaryKey(itemId);
        Map<String, Object> map = new HashMap<>();
        map.put("status", 1);
        map.put("msg", "删除成功");
        return map;
    }

    //获取与用户收藏的类别相同的最新发布的启事列表，按地理位置从近到远排序（特色功能）
    @RequestMapping("/getRecommendations")
    public Object getRecommendations(double longitude, double latitude, int num) {
        //根据用户id获取其关注的item列表
        String userid = request.getSession().getAttribute("userid").toString();
        System.out.print(userid);
        List<Collection> collectionList = collectionMapper.selectCollectionByUserId(Integer.valueOf(userid));
        List<String> categoryTypeList = new ArrayList<>();
        //获取用户关注的所有category,去重
        for(Collection collection : collectionList) {
            Item item = itemMapper.selectByPrimaryKey(collection.getItemid());
            String categoryType = item.getCategory()+item.getItemtype();
            if(!categoryTypeList.contains(categoryType)){//去重
                categoryTypeList.add(categoryType);
            }
        }
        List<Item> items = new ArrayList<>();//类型匹配的中间结果集
        //对用户关注的每个category-type对，筛选出item
        for (String ct:categoryTypeList) {
            String c = ct.substring(0,ct.length()-1);
            int t = Integer.parseInt(ct.substring(ct.length()-1,ct.length()));
            System.out.println("category:"+c+", type:"+t);
            items.addAll(itemMapper.selectAllItemByTAndC(t,c));
        }
        System.out.println("count of items:"+items.size());
        Point2D pointUser = new Point2D.Double(longitude,latitude);
        List<Item> resultItems = new ArrayList<>();//结果集
        List<Double> distanceList = new ArrayList<>();
        int count=0;//结果集的个数
        //for (Item item:items) {
        for(int l=0;l<items.size();l++){
            Item item = items.get(l);
            Point2D pointItem = new Point2D.Double(Double.valueOf(item.getLongitude()),Double.valueOf(item.getLatitude()));
            double distance = getDistance(pointUser,pointItem);
            if(count==0){
                distanceList.add(distance);
                resultItems.add(item);
                count++;
            }else if(count>=num){
                break;
            }else {
                int index=0;
                while (index<count && distance>distanceList.get(index)){
                    index++;
                }
                distanceList.add(index,distance);
                resultItems.add(index,item);
                count++;
            }
        }
        Map<String, Object> map = new HashMap<>();
        if(resultItems.isEmpty()) {
            map.put("status", 2);
            map.put("msg", "没有数据");
        }else {
            map.put("status", 1);
            map.put("msg", "");
            map.put("itemInfo", resultItems);
        }
        return map;
    }

    @RequestMapping("/getMyCollections")
    public Object getMyCollections(){
        Map<String, Object> map = new HashMap<>();
        String userid = request.getSession().getAttribute("userid").toString();
        List<Item> itemList = collectionMapper.getMyCollections(Integer.valueOf(userid));
        map.put("itemList",itemList);
        return map;
    }

    //我发布的寻物/招领启事
    @RequestMapping("/getItemInfosByUser")
    public Object getItemInfosByUser(int type){
        Map<String, Object> map = new HashMap<>();
        String userid = request.getSession().getAttribute("userid").toString();
        List<Item> itemList = itemMapper.getItemInfosByUser(Integer.valueOf(userid),type);
        map.put("status",1);
        map.put("msg","");
        map.put("itemList",itemList);
        return map;
    }

}
