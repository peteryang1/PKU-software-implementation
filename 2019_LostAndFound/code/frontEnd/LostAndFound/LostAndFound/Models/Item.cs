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
    /*
    public class Item
    {
        public int ItemId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string CreateDatetime { get; set; }
    }*/
    /*
     * Item是我们自定义的一个类型，包含三个属性，对应三个控件的属性
     * Content --> 文本框的内容
     * Source --> Image的Source
     * Ischecked --> Checkbox的checked
     * 这里继承了接口INotifyPropertyChanged，当客户端某一属性值发生更改时，发出通知
     */
    public class Item : INotifyPropertyChanged
    {
        public int ItemId;
        public int ItemType;
        public string Category;
        public string Place;
        public string Datetime;
        public string CreateUser;
        public string CreateUserName;
        public string Title;
        public string Content;
        public string CreateDatetime;

        public int gsItemId
        {
            get => ItemId;
            set { ItemId = value; OnPropertyChanged("ItemId"); }
        }
        public int gsItemType
        {
            get => ItemType;
            set { ItemType = value;OnPropertyChanged("ItemType"); }
        }
        public string gsCategory
        {
            get => Category;
            set { Category = value; OnPropertyChanged("Category"); }
        }
        public string gsPlace
        {
            get => Place;
            set { Place = value; OnPropertyChanged("Place"); }
        }
        public string gsDatetime {
            get => Datetime;
            set { Datetime = value;OnPropertyChanged("Datetime"); }
        }
        public string gsCreateUser
        {
            get => CreateUser;
            set { CreateUser = value; OnPropertyChanged("CreateUser"); }
        }
        public string gsCreateUserName
        {
            get => CreateUserName;
            set { CreateUserName = value; OnPropertyChanged("CreateUserName"); }
        }
        public string gsContent
        {
            get => Content;
            set { Content = value; OnPropertyChanged("Content"); }
        }
        public string gsTitle
        {
            get => Title;
            set { Title = value; OnPropertyChanged("Title"); }
        }
        public string gsCreateDatetime
        {
            get => CreateDatetime;
            set { CreateDatetime = value; OnPropertyChanged("CreateDatetime"); }
        }

        public Item(int itemId, int itemType, string category, string place,string datetime, string createUser,string createUserName, string content, string title, string createDatetime)
        {
            this.ItemId = itemId;
            this.ItemType = itemType;
            this.Category = category;
            this.Place = place;
            this.Datetime = datetime;
            this.CreateUser = createUser;
            this.CreateUserName = createUserName;
            this.Content = content;
            this.Title = title;
            this.CreateDatetime = createDatetime;
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

    public class ItemViewModel
    {
        private ObservableCollection<Item> defaultItems = new ObservableCollection<Item>();
        public ObservableCollection<Item> DefaultItems { get { return this.defaultItems; } }

        private Item item = new Item(1,1,"钱包","大路","2019-05-23","1","张三", "hh", "hahha", "2019-05-23");
        public Item MyItem { get { return this.item; } }

        public ItemViewModel() {
            this.defaultItems.Add(item);
        }

        //默认获取附近的启事
        public async Task getItemsAsync(double longitude,double latitude, int type, string category, int range, int num) {
            this.defaultItems.Clear();
            try
            {
                //获取全局的client对象，进行接口访问
                HttpClient client = (Application.Current as App).client;
                //接口的路径，与接口文档保持一致
                var uri = new Uri("https://lostandfoundapp.chinacloudsites.cn/item/getNearItems" +
                    //"?longitude=116.45543&latitude=39.87333&type=1&category=钱包&range=1000&num=3");
                      "?longitude="+longitude+"&latitude="+latitude+"&type="+type+"&category="+category+"&range="+range+"&num="+num+"");
                HttpResponseMessage response = await client.GetAsync(uri);
                Debug.WriteLine(response);
                JObject resultObj = JObject.Parse(response.Content.ReadAsStringAsync().Result);
                //如果status不为1，说明登录失败，将报错信息以弹框方式显示。
                if (int.Parse(resultObj["status"].ToString()) != 1)
                {
                    //ShowMessageDialog(resultObj["msg"].ToString());
                }
                else
                {
                    //根据文档可知，此方法传出结果的“itemInfo”是一个数组，用JAarry解析
                    JArray items = JArray.Parse(resultObj["itemInfo"].ToString());
                    Debug.WriteLine("size:" + items.Count.ToString());
                    for (int i = 0; i < items.Count; i++)
                    {
                        JObject item = JObject.Parse(items[i].ToString());
                        //测试是否已经拿到了数据，测试可用
                        Debug.WriteLine(item["category"]);
                        string myTitle = "";
                        if (int.Parse(item["itemtype"].ToString()) == 1)
                        {
                            myTitle = "【寻物启事】";
                        }
                        else {
                            myTitle = "【失物招领】";
                        }
                        myTitle += item["title"].ToString();
                        //Place超过六个字时省略后面的内容
                        string place = item["place"].ToString();
                        if(place.Length>6)
                            place = place.Substring(0, 6);
                        this.defaultItems.Add(new Item
                        (// int itemId, int itemType, string category, string place, string createUser, string content, string title, string createDatetime
                            int.Parse(item["itemid"].ToString()),
                            int.Parse(item["itemtype"].ToString()),
                            item["category"].ToString(),
                            place,
                            item["datetime"].ToString(),
                            item["createuserid"].ToString(),
                            "2",//resultObj["createusername"].ToString(),
                            item["content"].ToString(),
                            myTitle,
                            item["createdatetime"].ToString()
                        ));
                        
                    }
                }
            }
            catch(Exception ex)
            {
                Debug.WriteLine(ex.Message);
                Debug.WriteLine(ex.StackTrace);
                //Details in ex.Message and ex.HResult.   
            }
        }

        //根据item ID 获取特定item详情
        public async Task<Item> getItemAsync(int itemId)
        {
            Item resultItem= new Item(1, 1, "钱包", "和平大路","2019-05-13","3", "李四", "hhballalala", "hahha", "2019-05-23");
           
            try
            {
                //获取全局的client对象，进行接口访问
                HttpClient client = (Application.Current as App).client;
                //接口的路径，与接口文档保持一致
                var uri = new Uri("https://lostandfoundapp.chinacloudsites.cn/item/getItemInfo?itemId=" + itemId);
                HttpResponseMessage response = await client.GetAsync(uri);
                //Debug.WriteLine(response);
                JObject resultObj = JObject.Parse(response.Content.ReadAsStringAsync().Result);
                //如果status不为1，说明登录失败，将报错信息以弹框方式显示。
                if (int.Parse(resultObj["status"].ToString()) != 1)
                {
                    //ShowMessageDialog(resultObj["msg"].ToString());
                }
                else
                {
                    Debug.WriteLine("启事详情方法 here get the item:" + resultObj["itemInfo"]["title"].ToString());
                    resultItem = new Item(
                        int.Parse(resultObj["itemInfo"]["itemid"].ToString()),
                        int.Parse(resultObj["itemInfo"]["itemtype"].ToString()),
                        resultObj["itemInfo"]["category"].ToString(),
                        resultObj["itemInfo"]["place"].ToString(),
                        resultObj["itemInfo"]["datetime"].ToString(),
                        resultObj["itemInfo"]["createuserid"].ToString(),
                        resultObj["createusername"].ToString(),
                        resultObj["itemInfo"]["content"].ToString(),
                        resultObj["itemInfo"]["title"].ToString(),
                        resultObj["itemInfo"]["createdatetime"].ToString()
                        );
                    //this.item = new Item(1, 1, "钱包", "和平大路", "李四", "hhballalala", "hahha", "2019-05-23");
                    /*
                    this.item.ItemId = int.Parse(resultObj["itemInfo"]["itemid"].ToString());
                    this.item.ItemType = int.Parse(resultObj["itemInfo"]["itemtype"].ToString());
                    this.item.Category = resultObj["itemInfo"]["category"].ToString();
                    this.item.Place = resultObj["itemInfo"]["place"].ToString();
                    this.item.CreateUser = resultObj["itemInfo"]["createuserid"].ToString();
                    this.item.Content = resultObj["itemInfo"]["content"].ToString();
                    this.item.Title = resultObj["itemInfo"]["title"].ToString();
                    this.item.CreateDatetime = resultObj["itemInfo"]["createdatetime"].ToString();
                    */
                }
            }
            catch
            {
                Debug.WriteLine("here wrong in the getItem function");
                // Details in ex.Message and ex.HResult.   
            }
            //this.item = resultItem;
            return resultItem;
        }

        public async Task getRecommendationsAsync(double longitude, double latitude, int num)
        {
            this.defaultItems.Clear();
            try
            {
                //获取全局的client对象，进行接口访问
                HttpClient client = (Application.Current as App).client;
                //接口的路径，与接口文档保持一致
                var uri = new Uri("https://lostandfoundapp.chinacloudsites.cn/item/getRecommendations" +
                      //"item/getRecommendations?longitude=116.36326&latitude=39.76487&num=6
                      "?longitude=" + longitude + "&latitude=" + latitude + "&num=" + num + "");
                HttpResponseMessage response = await client.GetAsync(uri);
                Debug.WriteLine(response);
                JObject resultObj = JObject.Parse(response.Content.ReadAsStringAsync().Result);
                //如果status不为1，说明登录失败，将报错信息以弹框方式显示。
                if (int.Parse(resultObj["status"].ToString()) != 1)
                {
                    //ShowMessageDialog(resultObj["msg"].ToString());
                }
                else
                {
                    //根据文档可知，此方法传出结果的“itemInfo”是一个数组，用JAarry解析
                    JArray items = JArray.Parse(resultObj["itemInfo"].ToString());
                    for (int i = 0; i < items.Count; i++)
                    {
                        JObject item = JObject.Parse(items[i].ToString());
                        string myTitle = "";
                        if (int.Parse(item["itemtype"].ToString()) == 1)
                        {
                            myTitle = "【寻物启事】";
                        }
                        else
                        {
                            myTitle = "【失物招领】";
                        }
                        myTitle += item["title"].ToString();
                        string place = item["place"].ToString();
                        if (place.Length > 6)
                            place = place.Substring(0, 6);
                        this.defaultItems.Add(new Item
                        (// int itemId, int itemType, string category, string place, string createUser, string content, string title, string createDatetime
                            int.Parse(item["itemid"].ToString()),
                            int.Parse(item["itemtype"].ToString()),
                            item["category"].ToString(),
                            place,
                            item["datetime"].ToString(),
                            item["createuserid"].ToString(),
                            "",
                            item["content"].ToString(),
                            myTitle,
                            item["createdatetime"].ToString()
                        ));
                    }
                }
            }
            catch
            {
                // Details in ex.Message and ex.HResult.   
            }
        }

        public async Task getMyItemsList(int type)
        {
            this.defaultItems.Clear();
            try
            {
                //获取全局的client对象，进行接口访问
                HttpClient client = (Application.Current as App).client;
                //接口的路径，与接口文档保持一致
                var uri = new Uri("https://lostandfoundapp.chinacloudsites.cn/item/getItemInfosByUser?type=" + type);
                HttpResponseMessage response = await client.GetAsync(uri);
                Debug.WriteLine(response);
                JObject resultObj = JObject.Parse(response.Content.ReadAsStringAsync().Result);
                //如果status不为1，说明登录失败，将报错信息以弹框方式显示。
                if (int.Parse(resultObj["status"].ToString()) != 1)
                {
                    //ShowMessageDialog(resultObj["msg"].ToString());
                }
                else
                {
                    //根据文档可知，此方法传出结果的“itemInfo”是一个数组，用JAarry解析
                    JArray items = JArray.Parse(resultObj["itemList"].ToString());
                    for (int i = 0; i < items.Count; i++)
                    {
                        JObject item = JObject.Parse(items[i].ToString());
                        string myTitle = "";
                        if (int.Parse(item["itemtype"].ToString()) == 1)
                        {
                            myTitle = "【寻物启事】";
                        }
                        else
                        {
                            myTitle = "【失物招领】";
                        }
                        myTitle += item["title"].ToString();
                        string place = item["place"].ToString();
                        if (place.Length > 6)
                            place = place.Substring(0, 6);
                        this.defaultItems.Add(new Item
                        (// int itemId, int itemType, string category, string place, string createUser, string content, string title, string createDatetime
                            int.Parse(item["itemid"].ToString()),
                            int.Parse(item["itemtype"].ToString()),
                            item["category"].ToString(),
                            place,
                            item["datetime"].ToString(),
                            item["createuserid"].ToString(),
                            "",
                            item["content"].ToString(),
                            myTitle,
                            item["createdatetime"].ToString()
                        ));
                    }
                }
            }
            catch
            {
                // Details in ex.Message and ex.HResult.   
            }
        }

        public async Task getMyCollections()
        {
            this.defaultItems.Clear();
            try
            {
                //获取全局的client对象，进行接口访问
                HttpClient client = (Application.Current as App).client;
                //接口的路径，与接口文档保持一致
                var uri = new Uri("https://lostandfoundapp.chinacloudsites.cn/item/getMyCollections");
                HttpResponseMessage response = await client.GetAsync(uri);
                Debug.WriteLine(response);
                JObject resultObj = JObject.Parse(response.Content.ReadAsStringAsync().Result);
                //如果status不为1，说明登录失败，将报错信息以弹框方式显示。
                JArray items = JArray.Parse(resultObj["itemList"].ToString());
                for (int i = 0; i < items.Count; i++)
                {
                    JObject item = JObject.Parse(items[i].ToString());
                    string myTitle = "";
                    if (int.Parse(item["itemtype"].ToString()) == 1)
                    {
                        myTitle = "【寻物启事】";
                    }
                    else
                    {
                        myTitle = "【失物招领】";
                    }
                    myTitle += item["title"].ToString();
                    string place = item["place"].ToString();
                    if (place.Length > 6)
                        place = place.Substring(0, 6);
                    this.defaultItems.Add(new Item
                    (// int itemId, int itemType, string category, string place, string createUser, string content, string title, string createDatetime
                        int.Parse(item["itemid"].ToString()),
                        int.Parse(item["itemtype"].ToString()),
                        item["category"].ToString(),
                        place,
                        item["datetime"].ToString(),
                        item["createuserid"].ToString(),
                        "",
                        item["content"].ToString(),
                        myTitle,
                        item["createdatetime"].ToString()
                    ));
                }
            }
            catch
            {
                // Details in ex.Message and ex.HResult.   
            }
        }

    }

    public class ItemManager
    {
        public static ObservableCollection<Item> GetItems()
        {
            var items = new ObservableCollection<Item>();
            
            items.Add(new Item(1, 1, "钱包", "大路","2019-05-23","2", "张三", "hh", "hahha", "2019-05-23"));

            return items;
        }
    }
}
