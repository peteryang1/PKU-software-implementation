package com.example.lostandfound.controller;

import com.example.lostandfound.mapper.CollectionMapper;
import com.example.lostandfound.mapper.UserTableMapper;
import com.example.lostandfound.model.Collection;
import com.example.lostandfound.model.UserTable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/user", produces = "application/json;charset=UTF-8")
public class UserController {
    @Autowired
    private UserTableMapper userTableMapper;
    @Autowired
    private CollectionMapper collectionMapper;
    @Autowired
    HttpServletRequest request;

    @RequestMapping("/addUser")
    public String addUser() {
        UserTable userTable = new UserTable();
        userTable.setUserid(2);
        userTable.setUsername("zhangsan");
        userTable.setUsrpwd("123");
        userTableMapper.insert(userTable);
        return "ok";
    }

    @RequestMapping("/deleteUser")
    public String deleteUser(){
        userTableMapper.deleteByPrimaryKey(2);
        return "success deleted!";
    }

    @RequestMapping("/updateUser")
    public String updateUser(){
        UserTable userTable = userTableMapper.selectByPrimaryKey(2);
        userTable.setUsername("李四");
        userTableMapper.updateByPrimaryKey(userTable);
        return "success updated!";
    }

    @RequestMapping("/get")
    public List<UserTable> getAllUsers(){
        //UserTable userTable = userTableMapper.selectByPrimaryKey("1");
        //userTable.
        List<UserTable> users = userTableMapper.queryAll();
        return users;
    }

    @PostMapping("/login")
    public Object login(String username, String password){
        Map<String, Object> map = new HashMap<>();
        UserTable user = userTableMapper.login(username);
        if (user==null){
            map.put("status", 2);
            map.put("msg","用户名不存在！");
        }else {
            String pwd = user.getUsrpwd();
            System.out.println("pwd:"+pwd+",password:"+password+","+pwd.equals(password));
            if(pwd.equals(password)){
                map.put("status", 1);
                map.put("userId",user.getUserid());
                request.getSession().setAttribute("username", username);
                request.getSession().setAttribute("userid", user.getUserid());
                //System.out.println(request.getSession().getId());
            }else {
                map.put("status", 3);
                map.put("msg", "密码错误！");
            }
        }
        //responseBuilder.setMap(map);
        return map;
    }

    @PostMapping("/register")
    public Object register(String username, String password,String phoneNo,String portrait){
        Map<String, Object> map = new HashMap<>();
        UserTable user = userTableMapper.login(username);
        if (user!=null){
            map.put("status", 2);
            map.put("msg","用户名已存在！");
        }else {
            UserTable userTable = new UserTable();
            Integer id = 1;
            if(userTableMapper.getCount()>0){
                int maxId = userTableMapper.getMaxId();
                id = Integer.valueOf(maxId)+1;
            }
            System.out.print(id);
            userTable.setUserid(id);
            userTable.setUsername(username);
            userTable.setUsrpwd(password);
            userTable.setCredit(0);
            userTable.setScore(0);
            userTable.setPhonenumber(phoneNo);
            userTable.setPortrait(portrait);
            int status = userTableMapper.insert(userTable);
            map.put("status",status);
            if(status!=1) map.put("msg","注册失败！");
            map.put("userId",id);
            request.getSession().setAttribute("username", username);
            request.getSession().setAttribute("userid", id.toString());
        }
        return map;
    }

    @RequestMapping("/getUser")
    public Object getUser(){
        //System.out.println("getUser:"+request.getSession().getId());
        Map<String, Object> map = new HashMap<>();
        String username = (String)request.getSession().getAttribute("username");
        String userid = request.getSession().getAttribute("userid").toString();
        map.put("username",username);
        map.put("userid",userid);
        return map;
    }

    //用户对某启事添加收藏
    @PostMapping("/addStarToItem")
    public Object addStarToItem(int itemId){
        Map<String, Object> map = new HashMap<>();
        String userid = request.getSession().getAttribute("userid").toString();
        Collection collection = new Collection();
        String maxId = collectionMapper.getMaxId();
        Integer id = 1;
        if(maxId!=null) id = Integer.valueOf(maxId)+1;
        collection.setCoid(id);
        collection.setItemid(itemId);
        collection.setUserid(Integer.valueOf(userid));
        int status = collectionMapper.insert(collection);
        map.put("status",status);
        if(status!=1) map.put("msg","添加收藏失败！");
        //map.put("coId",id);
        return map;
    }

    //获取用户个人信息
    @RequestMapping("/getUserInfo")
    public Object getUserInfo(){
        Map<String, Object> map = new HashMap<>();
        String username = (String)request.getSession().getAttribute("username");
        String userid = request.getSession().getAttribute("userid").toString();
        UserTable userTable = userTableMapper.selectByPrimaryKey(Integer.valueOf(userid));
        map.put("status",1);
        map.put("user",userTable);
        return map;
    }

    //修改用户个人信息
    @PostMapping("/changeUserInfo")
    public Object changeUserInfo(String username, String password, String phoneNo, String portrait){
        Map<String, Object> map = new HashMap<>();
        String userid = request.getSession().getAttribute("userid").toString();
        UserTable user = userTableMapper.login(username);
        //System.out.println(username+":"+user.getUsername().equals(username));
        if (user == null || user.getUsername().equals(username)){
            UserTable userTable = userTableMapper.selectByPrimaryKey(Integer.valueOf(userid));
            userTable.setUsername(username);
            userTable.setPhonenumber(phoneNo);
            userTable.setPortrait(portrait);
            userTable.setUsrpwd(password);
            int status = userTableMapper.updateByPrimaryKey(userTable);
            map.put("status",status);
            map.put("msg","");
        }else{
            map.put("status", 2);
            map.put("msg","用户名已存在！");
        }
        return map;
    }
}
