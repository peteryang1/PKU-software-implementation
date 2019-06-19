using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Windows.UI.Xaml;

namespace LostAndFound.Models
{
    public class Message
    {
        public int MsgId;
        public int ItemId;
        public string Datetime;
        public string Title;
        public string Category;
        public string Content;
        public int MsgFromId;
        public string MsgFrom;
        public string MsgTo;
        //private int MsgToId;
        public int Status;
        public int gsItemId
        {
            get => ItemId;
            set { ItemId = value; OnPropertyChanged("ItemId"); }
        }
        public int gsMsgId
        {
            get => MsgId;
            set { MsgId = value; OnPropertyChanged("MsgId"); }
        }
        public string gsDatetime
        {
            get => Datetime;
            set { Datetime = value; OnPropertyChanged("Datetime"); }
        }
        public string gsCategory
        {
            get => Category;
            set { Category = value; OnPropertyChanged("Category"); }
        }
        public string gsContent
        {
            get => Content;
            set { Content = value; OnPropertyChanged("Content"); }
        }
        public int gsMsgFromId
        {
            get => MsgFromId;
            set { MsgFromId = value; OnPropertyChanged("MsgFromId"); }
        }
        public string gsMsgFrom{
            get => MsgFrom;
            set { MsgFrom = value;OnPropertyChanged("MsgFrom"); }
        }
        public string gsMsgTo
        {
            get => MsgTo;
            set { MsgTo = value; OnPropertyChanged("MsgTo"); }
        }
        public int gsStatus
        {
            get => Status;
            set { Status = value; OnPropertyChanged("Status"); }
        }
        public Message()
        { 
            this.MsgId = 1;
            this.ItemId = 1;
            this.Category = "";
            this.Datetime = "";
            this.Title = "";
            this.Content = "";
            this.MsgFromId = 1;
            this.MsgFrom = "";
            this.MsgTo = "";
            this.Status = 1;
        }
        public Message(int msgId, int itemId, string datetime,string title, string category,string content,int msgFromId,string msgFrom,string msgTo,int status)
        {
            this.MsgId = msgId;
            this.ItemId = itemId;
            this.Category = category;
            this.Datetime = datetime;
            this.Title = title;
            this.Content = content;
            this.MsgFromId = msgFromId;
            this.MsgFrom = msgFrom;
            this.MsgTo = msgTo;
            this.Status = status;
        }

        //显示实现接口，实现数据绑定动态更新
        public event PropertyChangedEventHandler PropertyChanged;

        protected void OnPropertyChanged(string propertyName = "")
        {
            PropertyChangedEventHandler handler = this.PropertyChanged;
            if (handler != null)
            {
                handler(this, new PropertyChangedEventArgs(propertyName));
            }
        }
    }

    public class MsgViewModel
    {
        private ObservableCollection<Message> defaultMsgs = new ObservableCollection<Message>();
        public ObservableCollection<Message> DefaultMsgs { get { return this.defaultMsgs; } }

        private Message msg = new Message(1, 1, "2019-05-23","标题","类别","内容",1,"zhangsan","",1);
        public Message MyMsg { get { return this.msg; } }

        public MsgViewModel()
        {
            this.defaultMsgs.Add(msg);
        }

        //默认获取附近的启事
        public async Task getMsgsAsync()
        {
            this.defaultMsgs.Clear();
            try
            {
                //获取全局的client对象，进行接口访问
                HttpClient client = (Application.Current as App).client;
                //接口的路径，与接口文档保持一致
                var uri = new Uri("https://lostandfoundapp.chinacloudsites.cn/message/getmsgList");
                HttpResponseMessage response = await client.GetAsync(uri);
                Debug.WriteLine(response);
                JObject resultObj = JObject.Parse(response.Content.ReadAsStringAsync().Result);
                //如果status不为1，说明登录失败，将报错信息以弹框方式显示。
                if (int.Parse(resultObj["status"].ToString()) != 1)
                {
                    ShowMessageDialog(resultObj["msg"].ToString());
                }
                else
                {
                    //根据文档可知，此方法传出结果的“itemInfo”是一个数组，用JAarry解析
                    JArray items = JArray.Parse(resultObj["itemInfo"].ToString());
                    Debug.WriteLine("size:" + items.Count.ToString());
                    //for (int i = 0; i < items.Count; i++)
                    for(int i = items.Count - 1; i > -1; i--)
                    {
                        JObject item = JObject.Parse(items[i].ToString());
                        Debug.WriteLine("消息列表获取到了吗？");
                        Debug.WriteLine(item["category"]);
                        this.defaultMsgs.Add(new Message
                        (//int msgId, int itemId, string datetime,string title, string category,string content,int msgFromId,int status
                            int.Parse(item["msgId"].ToString()),
                            int.Parse(item["itemId"].ToString()),
                            item["datetime"].ToString(),
                            item["title"].ToString(),
                            item["category"].ToString(),
                            item["content"].ToString(),
                            int.Parse(item["msgFromId"].ToString()),
                            item["msgFrom"].ToString(),
                            "",//msgto
                            int.Parse(item["status"].ToString())
                        ));

                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
                Debug.WriteLine(ex.StackTrace);
                //Details in ex.Message and ex.HResult.   
            }
            async void ShowMessageDialog(string msg)
            {
                var msgDialog = new Windows.UI.Popups.MessageDialog(msg) { Title = "提示" };
                msgDialog.Commands.Add(new Windows.UI.Popups.UICommand("确定"));
                await msgDialog.ShowAsync();
            }
        }

        //根据item ID 获取特定item详情
        public async Task getMsgListByItemAsync(int itemId)
        {
            this.defaultMsgs.Clear();
            try
            {
                //获取全局的client对象，进行接口访问
                HttpClient client = (Application.Current as App).client;
                //接口的路径，与接口文档保持一致
                var uri = new Uri("https://lostandfoundapp.chinacloudsites.cn/message/msgList?itemId="+itemId);
                HttpResponseMessage response = await client.GetAsync(uri);
                Debug.WriteLine(response);
                JObject resultObj = JObject.Parse(response.Content.ReadAsStringAsync().Result);
                //如果status不为1，说明登录失败，将报错信息以弹框方式显示。
                if (int.Parse(resultObj["status"].ToString()) != 1)
                {
                    ShowMessageDialog(resultObj["msg"].ToString());
                }
                else
                {
                    //根据文档可知，此方法传出结果的“itemInfo”是一个数组，用JAarry解析
                    JArray items = JArray.Parse(resultObj["itemInfo"].ToString());
                    Debug.WriteLine("某启事的消息列表条数:" + items.Count.ToString());
                    

                    //for (int i = 0; i < items.Count; i++)
                    for (int i = items.Count-1; i > -1; i--)
                    {
                        JObject item = JObject.Parse(items[i].ToString());
                        this.defaultMsgs.Add(new Message
                        (//int msgId, int itemId, string datetime,string title, string category,string content,int msgFromId,int status
                            int.Parse(item["msgId"].ToString()),
                            itemId,
                            item["datetime"].ToString(),
                            "",//title没用
                            "",//item["category"].ToString(),
                            item["content"].ToString(),
                            int.Parse(item["msgFromId"].ToString()),
                            item["msgFrom"].ToString(),
                            item["msgTo"].ToString(),
                            0//int.Parse(item["status"].ToString())
                        ));
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.Message);
                Debug.WriteLine(ex.StackTrace);
                //Details in ex.Message and ex.HResult.   
            }
            async void ShowMessageDialog(string msg)
            {
                var msgDialog = new Windows.UI.Popups.MessageDialog(msg) { Title = "提示" };
                msgDialog.Commands.Add(new Windows.UI.Popups.UICommand("确定"));
                await msgDialog.ShowAsync();
            }
        }
    }
    }
