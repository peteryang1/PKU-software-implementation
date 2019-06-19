using LostAndFound.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
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
    public sealed partial class itemMsgList : Page
    {
        private ItemViewModel itemViewModel { get; set; }
        private MsgViewModel msgViewModel { get; set; }
        
        public Item item = new Item(1, 1, "钱包", "和平大路", "2019-05-23", "2", "李四si", "hhballalala", "hahha", "2019-05-23");
        private int itemId = 1;
        private int msgClicked = 1;
        public Message msg = new Message();

        protected override async void OnNavigatedTo(NavigationEventArgs e)
        {
            int itemId = (int)e.Parameter;
            this.itemId = itemId;
            Debug.WriteLine("在启事消息详情页面获取到的itemId为" + itemId.ToString());
            this.item = await itemViewModel.getItemAsync(itemId);
            this.Bindings.Update();
            await msgViewModel.getMsgListByItemAsync(itemId);
            base.OnNavigatedTo(e);
        }
        public itemMsgList()
        {
            this.InitializeComponent();
            this.itemViewModel = new ItemViewModel();
            this.msgViewModel = new MsgViewModel();
        }
        private void backToMain(object sender, RoutedEventArgs e)
        {
            this.Frame.GoBack();
            //this.Frame.Navigate(typeof(denglu));
        }
        private void GridView_ItemClick(object sender, ItemClickEventArgs e)
        {
            var msgClicked = (Message)e.ClickedItem;
            this.msgClicked = msgClicked.ItemId;
        }

        private void addCommentAsync(object sender, RoutedEventArgs e)
        {
            //this.Frame.Navigate(typeof(sendMsg), this.itemId);
            MainNavigateToEvent(typeof(sendMsg), this.itemId);
        }

        public delegate void NavigateHandel(Type page, int itemId);
        public static event NavigateHandel MainNavigateToEvent;
    }
}
