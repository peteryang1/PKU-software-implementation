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
using Windows.UI.Xaml.Controls.Maps;
using Windows.Devices.Geolocation;
using System.Threading.Tasks;
using System.Net.Http;
using Newtonsoft.Json.Linq;
using System.Diagnostics;
using LostAndFound.Models;
using System.Collections.ObjectModel;



// https://go.microsoft.com/fwlink/?LinkId=234238 上介绍了“空白页”项模板

namespace LostAndFound
{
    /// <summary>
    /// 可用于自身或导航至 Frame 内部的空白页。
    /// </summary>
    public sealed partial class denglu : Page
    {
        //private List<Item> Items = ItemManager.GetItems();
        //private ObservableCollection<Item> Items;
        public ItemViewModel ViewModel { get; set; }
        //保存经纬度
        double longitude;
        double latitude;

        int clickedItemId = 1;
        public denglu()
        {
            this.InitializeComponent();
            this.ViewModel = new ItemViewModel();
            
            //getRecommendedItemsAsync();
            //Items = ItemManager.GetItems();
        }
        
        protected override async void OnNavigatedTo(NavigationEventArgs e)
        {
            Debug.WriteLine("here in the onNavigatedTo fun");
            //页面初始加载默认的附近启事推荐
            //"?longitude=116.45543&latitude=39.87333&type=1&category=钱包&range=1000&num=3");
            //异步获取位置，保存到变量中
            var position = await denglu.GetPosition();
            //维度
            double lat = position.Coordinate.Point.Position.Latitude;
            //经度
            double lon = position.Coordinate.Point.Position.Longitude;
            Debug.WriteLine("lat:" + lat + ",lon:" + lon);
            Debug.WriteLine("lat:" + latitude + ",lon:" + longitude);
            await ViewModel.getItemsAsync(116.36326, 39.76487, 0, "不限", 100000, 10);
            //await Task.Delay(1000);
            base.OnNavigatedTo(e);
        }
        public async static Task<Geoposition> GetPosition()
        {
            //请求对位置的访问权
            var accessStatus = await Geolocator.RequestAccessAsync();
            //此时，窗口会弹出提示是否允许应用访问位置，如果用户不允许则抛出异常
            if (accessStatus != GeolocationAccessStatus.Allowed) throw new Exception();
            //实例化定位类，并设置经纬度精确度（单位：米），一般为零，为保护用户隐私，建议减少精确度
            var geolocator = new Geolocator { DesiredAccuracyInMeters = 0 };
            //异步获取设备位置，并将位置保存到变量中（Geoposition类型）
            var position = await geolocator.GetGeopositionAsync();
            //返回位置
            return position;
        }
        
        private async void Page_Loaded(object sender, RoutedEventArgs e)
        {
            Debug.WriteLine("here in the load fun");
            //异步获取位置，保存到变量中
            var position = await denglu.GetPosition();
            //维度
            double lat = position.Coordinate.Point.Position.Latitude;
            //经度
            double lon = position.Coordinate.Point.Position.Longitude;
            longitude = lon;
            latitude = lat;
            location_text.Text = lat.ToString();
        }

        private void goback_Click(object sender, RoutedEventArgs e)
        {
            this.Frame.GoBack();
        }

        private void fanwei_combox_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {

        }

        private async void fabu_button_Click(object sender, RoutedEventArgs e)
        {
            this.Frame.Navigate(typeof(newItem));
        }


        private async void Image_Tapped_1(object sender, TappedRoutedEventArgs e)
        {
         
            var position = await denglu.GetPosition();
            //维度
            double lat = position.Coordinate.Point.Position.Latitude;
          
            //经度
            double lon = position.Coordinate.Point.Position.Longitude;
            location_text.Text = "维度："+lat.ToString("f3")+" ,"+"经度："+lon.ToString("f3");
        }

        private void userCenter_Click(object sender, RoutedEventArgs e)
        {
            this.Frame.Navigate(typeof(UserPage));
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {

        }
        private void clickItem(object sender, RoutedEventArgs e) {
            //Item selectedItem = ItemGridView.SelectedItem as Item;
            //Debug.WriteLine("click方法内：" + selectedItem.ItemId);
            this.Frame.Navigate(typeof(itemInfo), this.clickedItemId);
        }

        private void GridView_ItemClick(object sender, ItemClickEventArgs e)
        {
            var itemClicked = (Item)e.ClickedItem;
            this.clickedItemId = itemClicked.ItemId;
            Debug.WriteLine("Item here itemId is" + itemClicked.ItemId.ToString());
            this.Frame.Navigate(typeof(itemInfo), this.clickedItemId);
        }

        private async void searchAsync(object sender, RoutedEventArgs e)
        {
            //Items = ItemManager.GetItems();

            await ViewModel.getItemsAsync(116.36326, 39.76487, 0, "不限", 100000, 10);
        }

        private async void SearchTypeRadio_checkedAsync(object sender, RoutedEventArgs e)
        {
            RadioButton rb = sender as RadioButton;
            int searchType = int.Parse(rb.Tag.ToString());
            try
            {
                if (searchType == 1)
                {//按地理位置推荐
                    await ViewModel.getItemsAsync(116.36326, 39.76487, 0, "不限", 100000, 10);
                }
                else
                {//推荐用户收藏
                    await ViewModel.getRecommendationsAsync(116.36326, 39.76487, 10);
                }
            }
            catch (Exception ex) {
                Debug.WriteLine(ex.HResult);
                Debug.WriteLine(ex.Message);
                Debug.WriteLine(ex.StackTrace);
            }
            
        }
    }

}
