using LostAndFound.Models;
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

// https://go.microsoft.com/fwlink/?LinkId=234238 上介绍了“空白页”项模板

namespace LostAndFound
{
    /// <summary>
    /// 可用于自身或导航至 Frame 内部的空白页。
    /// </summary>
    
    public sealed partial class userNews : Page
    {
        private MsgViewModel ViewModel { get; set; }
        int clickedItemId = 1;
        public userNews()
        {
            this.InitializeComponent();
            this.ViewModel = new MsgViewModel();
        }
        protected override async void OnNavigatedTo(NavigationEventArgs e)
        {
            await ViewModel.getMsgsAsync();
            //await Task.Delay(1000);
            base.OnNavigatedTo(e);
        }
        //查看该条消息的消息列表
        private void checkMsgOfItem(object sender, RoutedEventArgs e)
        {

        }

        //回复消息
        private void responseMsg(object sender, RoutedEventArgs e)
        {

        }
        private void GridView_ItemClick(object sender, ItemClickEventArgs e)
        {
            var msgClicked = (Message)e.ClickedItem;
            this.clickedItemId = msgClicked.ItemId;
            //Debug.WriteLine("Item here itemId is" + itemClicked.ItemId.ToString());
            this.Frame.Navigate(typeof(itemMsgList), this.clickedItemId);
        }
    }
}
