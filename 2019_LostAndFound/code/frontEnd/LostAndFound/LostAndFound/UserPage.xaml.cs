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
    public sealed partial class UserPage : Page
    {
        public UserPage()
        {
            this.InitializeComponent();
            //BackButton.Visibility = Visibility.Collapsed;//默认返回按钮隐藏
            MyFrame.Navigate(typeof(userInfo)); //启动时直接载入userInfo
            userinfo.IsSelected = true; // page1定义的选项被选中
        }

        /*private void HamburgerButton_Click(object sender, RoutedEventArgs e)
        {
            MySplitView.IsPaneOpen = !MySplitView.IsPaneOpen;

        }*/

        private void BackButton_Click(object sender, RoutedEventArgs e)
        {
            if (MyFrame.CanGoBack)
            {
                MyFrame.GoBack();
                userinfo.IsSelected = true;
            }
        }

        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            userCollect.MainNavigateToEvent += usercollect_MianNavigateToEvent;
            userLost.MainNavigateToEvent += userlost_MianNavigateToEvent;
            userFound.MainNavigateToEvent += userfound_MianNavigateToEvent;
            itemMsgList.MainNavigateToEvent += itemmsglist_MianNavigateToEvent;
        }

        private void usercollect_MianNavigateToEvent(Type page,int itemId)
        {
            this.Frame.Navigate(typeof(itemInfo),itemId);
        }
        private void userlost_MianNavigateToEvent(Type page, int itemId)
        {
            this.Frame.Navigate(typeof(itemInfo), itemId);
        }
        private void userfound_MianNavigateToEvent(Type page, int itemId)
        {
            this.Frame.Navigate(typeof(itemInfo), itemId);
        }
        private void itemmsglist_MianNavigateToEvent(Type page, int itemId)
        {
            this.Frame.Navigate(typeof(sendMsg), itemId);
        }

        private void ListBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (userinfo.IsSelected)
            {
                //BackButton.Visibility = Visibility.Collapsed;
                MyFrame.Navigate(typeof(userInfo));
            }
            else if (userlost.IsSelected)
            {
                //BackButton.Visibility = Visibility.Visible;
                MyFrame.Navigate(typeof(userLost));
            }
            else if (userfound.IsSelected)
            {
                //BackButton.Visibility = Visibility.Visible;
                MyFrame.Navigate(typeof(userFound));
            }
            else if (usercollect.IsSelected)
            {
                //BackButton.Visibility = Visibility.Visible;
                MyFrame.Navigate(typeof(userCollect));
            }
            else if (usernews.IsSelected)
            {
                //BackButton.Visibility = Visibility.Visible;
                MyFrame.Navigate(typeof(userNews));
            }
        }

        private void backToMain(object sender, RoutedEventArgs e)
        {
            this.Frame.Navigate(typeof(denglu));
        }
        private void logout(object sender, RoutedEventArgs e)
        {
            this.Frame.Navigate(typeof(MainPage));
        }
    }
}
