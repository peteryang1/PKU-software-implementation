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
    public sealed partial class newItem : Page
    {
        private int itemType = 1;
        public newItem()
        {
            this.InitializeComponent();
        }

        //确认发布新启事
        private async void newItemSureAsync(object sender, RoutedEventArgs e)
        {
            //item / putItemInfo ? type = 1 & title = 寻找丢失黑色钱包一个 & label = 钱包 & content = blalalallalal & place = 和平大道 & longitude = 116.45555 & latitude = 39.87333
            int type = this.itemType;
            string title = itemTitle.Text;
            string label = itemCategory.Text;
            string content = itemContent.Text;
            string place = itemPlace.Text;
            string lostTime = itemLostTime.Text;
            double longitude = (Application.Current as App).longitude;
            double latitude = (Application.Current as App).latitude;
            if (title == "" || content == "")
            {
                ShowMessageDialog("标题和内容不允许为空！");
            }
            //要访问的接口路径
            var uri = new Uri("https://lostandfoundapp.chinacloudsites.cn/item/putItemInfo");
            // Always catch network exceptions for async methods
            try
            {
                HttpClient client = (Application.Current as App).client;
                //HttpClient client = new HttpClient();
                Dictionary<string, string> dict = new Dictionary<string, string>(); ;
                dict.Add("type", type.ToString());
                dict.Add("title", title);
                dict.Add("label", label);
                dict.Add("content", content);
                dict.Add("place", place);
                dict.Add("lostTime", lostTime);
                dict.Add("longitude", longitude.ToString());
                dict.Add("latitude", latitude.ToString());
                Debug.WriteLine("参数列表-发布启事");
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
                    this.Frame.Navigate(typeof(itemInfo),int.Parse(resultObj["itemId"].ToString()));
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

        private void chooseLocation(object sender, RoutedEventArgs e)
        {
            MapDialog mapDialog = new MapDialog("显示内容");
            mapDialog.ShowWIndow();
        }

        private void backToMain(object sender, RoutedEventArgs e)
        {
            this.Frame.Navigate(typeof(denglu));
        }

        private void itemTypeRadio_checked(object sender, RoutedEventArgs e)
        {
            RadioButton rb = sender as RadioButton;
            this.itemType = int.Parse(rb.Tag.ToString());
            Debug.WriteLine("radio tag:" + this.itemType);
        }
    }
}
