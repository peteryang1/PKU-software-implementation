using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
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
using LostAndFound.Models;
using System.Net.Http;
using Newtonsoft.Json.Linq;
using System.Threading.Tasks;
using System.Diagnostics;

// https://go.microsoft.com/fwlink/?LinkId=234238 上介绍了“空白页”项模板

namespace LostAndFound
{
    /// <summary>
    /// 可用于自身或导航至 Frame 内部的空白页。
    /// </summary>
    public sealed partial class userInfo : Page
    {
        private string username;
        public userInfo()
        {
            this.InitializeComponent();
            //UserInfos = userInfoManager.GetUserInfos;
        }
        protected override async void OnNavigatedTo(NavigationEventArgs e)
        {
            await getUserInfoAsyn();
            this.Bindings.Update();
            base.OnNavigatedTo(e);
        }
        private async Task getUserInfoAsyn()
        {
            //要访问的接口路径
            var uri = new Uri("https://lostandfoundapp.chinacloudsites.cn/user/getUserInfo");
            // Always catch network exceptions for async methods
            try
            {
                HttpClient client = (Application.Current as App).client;
                HttpResponseMessage response = await client.GetAsync(uri);
                JObject resultObj = JObject.Parse(response.Content.ReadAsStringAsync().Result);
                //如果status不为1，说明登录失败，将报错信息以弹框方式显示。
                if (int.Parse(resultObj["status"].ToString()) != 1)
                {
                    ShowMessageDialog(resultObj["msg"].ToString());
                }
                else
                {
                    this.username = resultObj["user"]["username"].ToString();
                    Debug.WriteLine(this.username + "***");
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
        //
        // private int UserInfos;

    }
}
