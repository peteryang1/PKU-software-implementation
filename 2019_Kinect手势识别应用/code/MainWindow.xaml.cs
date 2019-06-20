using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using System.Management;//添加引用
using System.IO;

namespace HandScannerMk5
{  
    public partial class MainWindow : Window
    {
        Adapter mAdapter;
        Engine eng;
        bool Start = false;
        bool NumberFlag = false;
        bool RPSFlag = false;
        string[] NumberString = {"零", "一", "二", "三", "四", "五"};
        string[] RPSString = { "石头", "剪刀", "布"};
        public void FeedPixels(byte[] b)
        {
            eng = new Engine();
            eng.FeedDepthPixels(b);
            bool ret = eng.Food();
            if (!ret)
            {
                if(eng.Dmin < 36)
                    Dmin.Content = "距离太近，请离远一点";
                else
                    Dmin.Content = "手掌不存在";
                ERROR.Content = "Kinect未能在有效区域检测到手";
                if (NumberFlag || RPSFlag)
                    RECOGNITION.Content = "未识别";

                cImage1.Source = eng.WriteToBitmap2();   //原始深度图像
            }
            else
            {
                double dist = Math.Round(1.57 * eng.Dmin + 1.95 + (new Random().NextDouble()) / 7, 1);
                Dmin.Content = "最近距离：" + dist + "cm";
                ERROR.Content = "距离限制为60cm~200cm";
                if (NumberFlag)
                {
                    if (eng.mFingers.Count > 5)
                        RECOGNITION.Content = "未识别";
                    else
                        RECOGNITION.Content = "识别结果为：   " + NumberString[eng.mFingers.Count];
                }
                if(RPSFlag)
                {
                    if (eng.mFingers.Count > 5)
                        RECOGNITION.Content = "未识别";
                    else
                        RECOGNITION.Content = "识别结果：   " + RPSString[eng.mFingers.Count / 2];
                }

                cImage1.Source = eng.WriteToBitmap1();   //显示手
            }
            cImage2.Source = eng.WriteToBitmap2();  //原始深度图像
        }
        public MainWindow()
        {
            InitializeComponent();
        }
        private void start_Click(object sender, RoutedEventArgs e)  //显示实时深度图像和处理后的图像
        {
            Start = true;
            mAdapter = new Adapter(false, FeedPixels);
        }

        private void RPS_Click(object sender, RoutedEventArgs e)
        {
            if (Start)
            {
                NumberFlag = false;
                RPSFlag = true;
            }
            else
            {
                RECOGNITION.Content = "请先按开始按钮";
            }
        }

        private void Number_Click(object sender, RoutedEventArgs e)
        {
            if(Start)
            {
                NumberFlag = true;
                RPSFlag = false;
            }
            else
            {
                RECOGNITION.Content = "请先按开始按钮";
            }
        }
    }
}