using LostAndFound.Models;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;

// https://go.microsoft.com/fwlink/?LinkId=234238 上介绍了“空白页”项模板

namespace LostAndFound
{
    /// <summary>
    /// 可用于自身或导航至 Frame 内部的空白页。
    /// </summary>
    public sealed partial class sendMsg : Page
    {
        public ItemViewModel itemViewModel { get; set; }
        public Item item = new Item(1, 1, "钱包", "和平大路","2019-05-24","2", "李四si", "hhballalala", "hahha", "2019-05-23");
        private int itemId=1;
        public sendMsg()
        {
            this.InitializeComponent();
            this.itemViewModel = new ItemViewModel();
        }

        private void backToItemInfo(object sender, RoutedEventArgs e)
        {
            this.Frame.Navigate(typeof(itemInfo),this.itemId);
        }
        protected override async void OnNavigatedTo(NavigationEventArgs e)
        {
            this.itemId = (int)e.Parameter;
            Debug.WriteLine("在消息详情页面获取到的itemId为" + itemId.ToString());
            this.item = await itemViewModel.getItemAsync(itemId);
            this.Bindings.Update();
            base.OnNavigatedTo(e);
        }

        //确认发表评论
        private async void addCommentAsync(object sender, RoutedEventArgs e)
        {
            string content = CommentContent.Text;
            int infoId = this.itemId;
            string msgTo = this.item.CreateUser;
            if (content == "")
            {
                ShowMessageDialog("标题和内容不允许为空！");
            }
            //要访问的接口路径
            var uri = new Uri("https://lostandfoundapp.chinacloudsites.cn/message/sendMsg");
            // Always catch network exceptions for async methods
            //?infoId=1&msgTo=2&content=我刚看到了您发的启事
            try
            {
                HttpClient client = (Application.Current as App).client;
                //HttpClient client = new HttpClient();
                Dictionary<string, string> dict = new Dictionary<string, string>(); 
                dict.Add("infoId", infoId.ToString());
                dict.Add("msgTo", msgTo);
                dict.Add("content", content);
                Debug.WriteLine("参数列表-发消息");
                Debug.WriteLine(dict.ToString());
                FormUrlEncodedContent formUrlEncodedContent = new FormUrlEncodedContent(dict);
                HttpResponseMessage response = await client.PostAsync(uri, formUrlEncodedContent);
                JObject resultObj = JObject.Parse(response.Content.ReadAsStringAsync().Result);
                //如果status不为1，说明登录失败，将报错信息以弹框方式显示。
                if (int.Parse(resultObj["status"].ToString()) != 1)
                {
                    ShowMessageDialog(resultObj["msg"].ToString());
                }
                else
                {
                    //发布成功，跳转启事详情页面
                    ShowMessageDialog("发布成功！");
                    this.Frame.Navigate(typeof(itemInfo), int.Parse(resultObj["itemId"].ToString()));
                }

            }
            catch
            {
                // Details in ex.Message and ex.HResult.   
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
