using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.ApplicationModel.Core;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Core;
using Windows.UI.ViewManagement;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;

// The Blank Page item template is documented at https://go.microsoft.com/fwlink/?LinkId=402352&clcid=0x409

namespace App5
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainPage : Page
    {
        public MainPage()
        {
            this.InitializeComponent();
            PreFrame.Navigate(typeof(HomePage));
            HomeItem.IsSelected = true;
        }

        private void HamburgerButton_Click(object sender, RoutedEventArgs e)
        {
            AppOptionsView.IsPaneOpen = !AppOptionsView.IsPaneOpen;
        }


        private void AppOptionsBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            var lstbox = sender as ListBox;
            var item = lstbox.SelectedItem as ListBoxItem;
            if (item != null) {
                switch (item.Name) {
                    case "HomeItem":
                        PreFrame.Navigate(typeof(HomePage));
                        TitleBlock.Text = "推荐";
                        break;
                    case "CollectionsItem":
                        PreFrame.Navigate(typeof(CollectionsPage));
                        TitleBlock.Text = "收藏夹";
                        break;
                    case "MessageItem":
                        PreFrame.Navigate(typeof(MessagePage));
                        TitleBlock.Text = "消息";
                        break;
                    default:
                        break;
                }
                if (OtherOptionsBox.SelectedItem != null)
                    ((ListBoxItem)OtherOptionsBox.SelectedItem).IsSelected = false;
            }
        }

        private void RefreshButton_Click(object sender, RoutedEventArgs e)
        {

        }


        private void OtherOptionsBox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            var lstbox = sender as ListBox;
            var item = lstbox.SelectedItem as ListBoxItem;
            if (item != null) {
                switch (item.Name) {
                    case "ProfileItem":
                        PreFrame.Navigate(typeof(ProfilePage));
                        TitleBlock.Text = "个人中心";
                        break;
                    case "SettingItem":
                        PreFrame.Navigate(typeof(SettingPage));
                        TitleBlock.Text = "设置";
                        break;
                    default:
                        break;
                }
                if (AppOptionsBox.SelectedItem != null)
                    ((ListBoxItem)AppOptionsBox.SelectedItem).IsSelected = false;
            }
        }

        private async void UploadWork_Click(object sender, RoutedEventArgs e)
        {
            CoreApplicationView newView = CoreApplication.CreateNewView();
            int newViewId = 0;
            await newView.Dispatcher.RunAsync(CoreDispatcherPriority.Normal, () =>
            {
                Frame frame = new Frame();
                frame.Navigate(typeof(PublishPage), null);
                Window.Current.Content = frame;
                // You have to activate the window in order to show it later.
                Window.Current.Activate();

                newViewId = ApplicationView.GetForCurrentView().Id;
            });
            bool viewShown = await ApplicationViewSwitcher.TryShowAsStandaloneAsync(newViewId);
        }
    }
}
