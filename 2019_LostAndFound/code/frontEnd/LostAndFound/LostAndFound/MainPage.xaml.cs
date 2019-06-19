using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
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
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

// https://go.microsoft.com/fwlink/?LinkId=402352&clcid=0x804 上介绍了“空白页”项模板

namespace LostAndFound
{
    /// <summary>
    /// 可用于自身或导航至 Frame 内部的空白页。
    /// </summary>
    public sealed partial class MainPage : Page
    {
        public MainPage()
        {
            this.InitializeComponent();
        }

        private void TextBox_TextChanged(object sender, TextChangedEventArgs e)
        {

        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            this.Frame.Navigate(typeof(zhuce));
        }

        //登录按钮，点击登录
        private async void Login_Btn_ClickAsync(object sender, RoutedEventArgs e)
        {
            //获取两个输入框的值
            string username = textBox_username.Text;
            string password = textBox_password.Password;
            if (username == "" || password == "") {
                ShowMessageDialog("用户名和密码不允许为空！");
            }
            //要访问的接口路径
            var uri = new Uri("https://lostandfoundapp.chinacloudsites.cn/user/login");
            // Always catch network exceptions for async methods
            try 
            {
                HttpClient client = (Application.Current as App).client;
                //HttpClient client = new HttpClient();
                Dictionary<string, string> dict = new Dictionary<string, string>(); ;
                dict.Add("username", username);
                dict.Add("password", password);
                FormUrlEncodedContent formUrlEncodedContent = new FormUrlEncodedContent(dict);
                HttpResponseMessage response = await client.PostAsync(uri, formUrlEncodedContent);
                JObject resultObj = JObject.Parse(response.Content.ReadAsStringAsync().Result);
                //如果status不为1，说明登录失败，将报错信息以弹框方式显示。
                if (int.Parse(resultObj["status"].ToString()) != 1)
                {
                    ShowMessageDialog(resultObj["msg"].ToString());
                }
                else {
                    //登录成功，跳转页面
                    this.Frame.Navigate(typeof(denglu));
                }
                /*
                //处理Json数组的方法，登录用不到
                JArray users = JArray.Parse(result);
                string user = "user:";
                for (int i = 0; i < users.Count; ++i)  //遍历JArray  
                {
                    JObject tempo = JObject.Parse(users[i].ToString());
                    user += "id-" + tempo["userid"] + ";";
                    user += "name-" + tempo["username"] + ";\n";

                }
                Debug.WriteLine(user);
                */
                
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

        public async Task testFunAsync()
        {
            Debug.WriteLine("in the function testFun");
            try
            {
                HttpClient client = (Application.Current as App).client;
                var uri = new Uri("https://lostandfoundapp.chinacloudsites.cn/user/getUser");
                HttpResponseMessage response = await client.GetAsync(uri);
                JObject resultObj = JObject.Parse(response.Content.ReadAsStringAsync().Result);
                Debug.WriteLine(resultObj);
                Debug.WriteLine(resultObj["username"]);
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
