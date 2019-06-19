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
    public sealed partial class userCollect : Page
    {
        public ItemViewModel ViewModel { get; set; }
        int clickedItemId = 1;
        public userCollect()
        {
            this.InitializeComponent();
            this.ViewModel = new ItemViewModel();
        }

        private void clickItem(object sender, RoutedEventArgs e)
        {
            this.Frame.Navigate(typeof(itemInfo));
        }

        protected override async void OnNavigatedTo(NavigationEventArgs e)
        {
            await ViewModel.getMyCollections();
            base.OnNavigatedTo(e);
        }
        private void deleteCollect(object sender, RoutedEventArgs e)
        {

        }
        private void GridView_ItemClick(object sender, ItemClickEventArgs e)
        {
            var itemClicked = (Item)e.ClickedItem;
            this.clickedItemId = itemClicked.ItemId;
            //Debug.WriteLine("Item here itemId is" + itemClicked.ItemId.ToString());
            //this.Frame.Navigate(typeof(itemInfo), this.clickedItemId);
            MainNavigateToEvent(typeof(itemInfo), this.clickedItemId);
        }

        public delegate void NavigateHandel(Type page,int itemId);
        public static event NavigateHandel MainNavigateToEvent;
    }
}
