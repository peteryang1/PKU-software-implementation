using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.UI.Xaml.Controls;
using Windows.UI.Core;
using Windows.UI.ViewManagement;
using Windows.UI.Xaml;

namespace App5
{
    public sealed partial class PublishPage : Page
    {
        public PublishPage()
        {
            this.InitializeComponent();
        }

        private async void Upload_ClickAsync(object sender, Windows.UI.Xaml.RoutedEventArgs e)
        {
            var picker = new Windows.Storage.Pickers.FileOpenPicker();
            picker.ViewMode = Windows.Storage.Pickers.PickerViewMode.Thumbnail;
            picker.SuggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.PicturesLibrary;
            picker.FileTypeFilter.Add(".pdf");
            picker.FileTypeFilter.Add(".doc");
            picker.FileTypeFilter.Add(".docx");

            Windows.Storage.StorageFile file = await picker.PickSingleFileAsync();
            if (file != null) {
                // Application now has read/write access to the picked file
                FileName.Text = file.Name;
            } else {
                FileName.Text = "操作取消";
            }
        }

        private void Button_Click(object sender, Windows.UI.Xaml.RoutedEventArgs e)
        {
            Window.Current.Close();
        }
    }
}
