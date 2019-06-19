package com.example.lostandfound.controller;
import com.example.lostandfound.mapper.CollectionMapper;
import com.example.lostandfound.mapper.ItemMapper;
import com.example.lostandfound.mapper.MessageMapper;
import com.example.lostandfound.mapper.UserTableMapper;
import com.example.lostandfound.model.Collection;
import com.example.lostandfound.model.Item;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.ResultMap;
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
@RequestMapping(value = "/message", produces = "application/json;charset=UTF-8")
public class MessageController {

    @Autowired
    private MessageMapper messageMapper;
    @Autowired
    private UserTableMapper userTableMapper;
    @Autowired
    private ItemMapper itemMapper;
    @Autowired
    HttpServletRequest request;

    //发送消息
    @PostMapping("/sendMsg")
    public Object sendMsg(int infoId, int msgTo, String content){
        Map<String, Object> map = new HashMap<>();
        String userid = request.getSession().getAttribute("userid").toString();
        Message message = new Message();
        String maxId = messageMapper.getMaxId();
        Integer id = 1;
        if(maxId!=null) id = Integer.valueOf(maxId)+1;
        message.setContent(content);
        message.setMsgid(id);
        message.setCreatedatetime(new Date());
        message.setSendusrid(Integer.valueOf(userid));
        message.setTousrid(msgTo);
        message.setItemid(infoId);
        message.setStatus(0);
        int status = messageMapper.insert(message);
        map.put("status",status);
        if(status!=1) map.put("msg","发送消息失败！");
        return map;
    }

    //更新消息状态为已查看
    @PostMapping("/checkMsg")
    public Object sendMsg(int msgId){
        Map<String, Object> map = new HashMap<>();
        Message message = messageMapper.selectByPrimaryKey(msgId);
        message.setStatus(1);
        int status = messageMapper.updateByPrimaryKey(message);
        map.put("status",status);
        if(status!=1) map.put("msg","更新消息状态失败！");
        return map;
    }

    //获取用户未查看消息条数
    @RequestMapping("/getUncheckedMsgNum")
    public Object getUncheckedMsgNum(){
        Map<String, Object> map = new HashMap<>();
        String userid = request.getSession().getAttribute("userid").toString();
        int count = messageMapper.getUncheckedMsgNum(Integer.valueOf(userid));
        map.put("status",1);
        map.put("count",count);
        map.put("msg","");
        return map;
    }

    //
    @RequestMapping("/getmsgList")
    public Object getmsgList(){
        Map<String, Object> map = new HashMap<>();
        String userid = request.getSession().getAttribute("userid").toString();
        if (userid==null){
            map.put("status",3);
            map.put("msg","用户未登录！");
            return map;
        }
        List<Message> resultItems = messageMapper.getmsgList(Integer.valueOf(userid));
        List<Object> results = new ArrayList<>();
        for (Message msg:resultItems){
            int sendUsrId = msg.getSendusrid();
            String sendUserName = userTableMapper.getUsername(sendUsrId);
            Map<String,Object> result= new HashMap<>();
            result.put("msgId",msg.getMsgid());
            result.put("itemId",msg.getItemid());
            Item item = itemMapper.selectByPrimaryKey(msg.getItemid());
            result.put("title",item.getTitle());
            result.put("category",item.getCategory());
            result.put("content",msg.getContent());
            result.put("datetime",msg.getCreatedatetime());
            result.put("msgFrom",sendUserName);
            result.put("msgFromId",sendUsrId);
            result.put("status",msg.getStatus());
            results.add(result);
        }
        if(results.isEmpty()) {
            map.put("status", 2);
            map.put("msg", "没有数据");
        }else {
            map.put("status", 1);
            map.put("msg", "");
            map.put("itemInfo", results);
        }
        return map;
    }

    //获取某启事下用户参与的消息列表
    @RequestMapping("/msgList")
    public Object getMsgList(int itemId) {
        //根据用户id获取其关注的item列表
        Map<String, Object> map = new HashMap<>();
        String userid = request.getSession().getAttribute("userid").toString();
        if (userid==null){
            map.put("status",3);
            map.put("msg","用户未登录！");
            return map;
        }
        List<Message> resultItems = messageMapper.getMsgMeSent(Integer.valueOf(userid),itemId);
        resultItems.addAll(messageMapper.getMsgMeReceived(Integer.valueOf(userid),itemId));
        List<Object> results = new ArrayList<>();
        for (Message msg:resultItems){
            int toUsrId = msg.getTousrid();
            int sendUsrId = msg.getSendusrid();
            String toUsrName  = userTableMapper.getUsername(toUsrId);
            String sendUserName = userTableMapper.getUsername(sendUsrId);
            Map<String,Object> result= new HashMap<>();
            result.put("msgId",msg.getMsgid());
            result.put("content",msg.getContent());
            result.put("datetime",msg.getCreatedatetime());
            result.put("msgFrom",sendUserName);
            result.put("msgTo",toUsrName);
            result.put("msgFromId",sendUsrId);
            result.put("msgToId",toUsrId);
            results.add(result);
        }
        if(resultItems.isEmpty()) {
            map.put("status", 2);
            map.put("msg", "没有数据");
        }else {
            map.put("status", 1);
            map.put("msg", "");
            map.put("itemInfo", results);
        }
        return map;
    }
}
