using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Controls;

using System.Management;//添加引用
using System.IO;

namespace HandScannerMk5
{
    public struct Point   //点的数据结构
    {
        public static int sWidth = 512;
        public int X;
        public int Y;
        public int D;
        public Point(int x, int y)
        {
            X = x;  //横坐标
            Y = y;  //纵坐标 
            D = 0; //深度    60-80为有效距离
        }
        public int GetDistanceExp2(Point p)
        {
            int dx = p.X - X;
            int dy = p.Y - Y;
            return dx * dx + dy * dy;
        }
    };

    class PointWithDist     //点和距离的类
    {
        public PointWithDist(Point p, int dist)
        {
            mPoint = p;
            mDistance = dist;
        }

        public Point mPoint;
        public int mDistance;
    }

    class Engine     
    {
  
        public byte[] mDepthPixels;  //原始深度保存信息
        public byte[] mSamplePixels;  //处理后的图像保存信息
        public int mDepthWidth;
        public int mDepthHeight;

        public List<Point> mHandArea = new List<Point>();//手内部信息
        public List<Point> mContour = new List<Point>();//边界信息
        public List<Point> mFirst = new List<Point>();//firstfinger历史点
      
        public Point mCenter; 
        public List<Point> mFingers = new List<Point>();
        //0黑255白
        const byte kInvalid = 0;
        const byte kLikely = 16;
        const byte kValid = 32;
        const byte kContour = 64;
        const byte kColor = 255;
        //Depth 31-124
        const int MAXN = 130;
        public int Dmin = 127;
        public int[] depth = new int[130];
        public void FeedDepthPixels(byte[] depthPixels, int width = 512, int height = 414)
        {
            mDepthPixels = depthPixels;
            mDepthWidth = width;   //长宽都相等，不用去除
            mDepthHeight = height;
            mSamplePixels = new byte[mDepthWidth * mDepthHeight];
        }
        public WriteableBitmap WriteToBitmap2()   //显示原始深度图像
        {
            var bitmap = new WriteableBitmap(mDepthWidth, mDepthHeight, 96.0, 96.0, PixelFormats.Gray8, null);
            bitmap.WritePixels(
                new Int32Rect(0, 0, bitmap.PixelWidth, bitmap.PixelHeight),
                mDepthPixels,
                bitmap.PixelWidth,
                0);
            return bitmap;
        }
        public WriteableBitmap WriteToBitmap1()    //显示手部图像
        {
            var bitmap = new WriteableBitmap(mDepthWidth, mDepthHeight, 96.0, 96.0, PixelFormats.Gray8, null);
            bitmap.WritePixels(
                new Int32Rect(0, 0, bitmap.PixelWidth, bitmap.PixelHeight),
                mSamplePixels,
                bitmap.PixelWidth,
                0);
            return bitmap;
        }

        public bool Food()
        {
            double tempdist = mDepthHeight * 3 / 9.0;
            int tempint;
            for (int i = mDepthHeight / 6; i < mDepthHeight * 5 / 6; ++i)
            {
                for (int j = mDepthWidth / 6; j < mDepthWidth * 5 / 6; ++j)
                {
                    tempint = mDepthPixels[i * mDepthWidth + j];
                    if(tempint > 0 && tempint < 130)
                    {
                        depth[tempint]++;
                        if (tempint < Dmin)
                            Dmin = tempint;
                    }
                    double dist = Math.Sqrt((i - mDepthHeight / 2) * (i - mDepthHeight / 2) + (j - mDepthWidth / 2) * (j - mDepthWidth / 2));
                    mSamplePixels[i * mDepthWidth + j] = (dist > tempdist ? kInvalid : (byte)tempint);
                }
            }
            if (Dmin <= 36)  return false;
            int thr = MAXN;
            int max1 = 0;
            for (int i = Dmin + 1; i < 118 && depth[i] > 0; i++)
            {
                if (depth[i] > max1)
                {
                    max1 = depth[i];
                    thr = i;
                }
            }
            //大于150cm时阈值分割偶尔会失灵
            thr = threshold(depth, Dmin, thr);
            for (int x = mDepthWidth / 6; x < mDepthWidth * 5 / 6; x++)
                for (int y = mDepthHeight / 6; y < mDepthHeight * 5 / 6; y++)
                    //if(mSamplePixels[y * mWidth + x] > 5) //老版本，精准度更高
                    if (mSamplePixels[y * mDepthWidth + x] > thr)
                        mSamplePixels[y * mDepthWidth + x] = kInvalid;
            //*
            border();
            if (!search_Center()) return false;
            mSamplePixels[mCenter.Y * mDepthWidth + mCenter.X] = kColor; //中心点
            if((mCenter.Y - 1) * mDepthWidth + mCenter.X >= 0) mSamplePixels[(mCenter.Y - 1) * mDepthWidth + mCenter.X] = kColor; //中心点
            mSamplePixels[(mCenter.Y + 1) * mDepthWidth + mCenter.X] = kColor; //中心点
            mSamplePixels[mCenter.Y * mDepthWidth + mCenter.X + 1] = kColor; //中心点
            if(mCenter.Y * mDepthWidth + mCenter.X - 1 >= 0) mSamplePixels[mCenter.Y * mDepthWidth + mCenter.X - 1] = kColor; //中心点
            for (int i = 0; i < mDepthHeight; ++i)
            {
                for (int j = 0; j < mDepthWidth; ++j)
                {
                    double dist = Math.Sqrt((i - mCenter.Y) * (i - mCenter.Y) + (j - mCenter.X) * (j - mCenter.X));
                    if (dist > 90 - (Dmin - 45) * 0.4)
                        mSamplePixels[i * mDepthWidth + j] = kInvalid;
                }
            }
            //*
            search_finger();
            foreach (Point p in mFingers)
            {
                mSamplePixels[p.Y * mDepthWidth + p.X] = kColor;
                mSamplePixels[(p.Y + 1) * mDepthWidth + p.X] = kColor;
                if((p.Y - 1) * mDepthWidth + p.X>=0)mSamplePixels[(p.Y - 1) * mDepthWidth + p.X] = kColor;
                mSamplePixels[p.Y * mDepthWidth + p.X + 1] = kColor;
                if(p.Y * mDepthWidth + p.X - 1>=0)mSamplePixels[p.Y * mDepthWidth + p.X - 1] = kColor;
            }
            //*/
            return true;
        }
        int threshold(int[] a, int Dmin, int Dmax)
        {
            double[] h = new double[MAXN], sh = new double[MAXN];
            h[0] = sh[0] = 0.0;
            for (int i = 1; i < Dmax; i++)
            {
                h[i] = h[i - 1] + a[i];
                sh[i] = sh[i - 1] + a[i] * i;
            }
            int ans = 0;
            double Tmax = 0;
            for (int i = Dmin + 1; i < Dmax - 1; i++)
            {
                double p0 = h[i], p1 = h[Dmax - 1] - h[i];
                double m0 = sh[i] / p0, m1 = (sh[Dmax - 1] - sh[i]) / p1;
                //double T = p0 * m0 * m0 + p1 * m1 * m1;
                double T = p0*m0*Math.Log(m0)+p1*m1* Math.Log(m1);
                if (T > Tmax)
                {
                    Tmax = T;
                    ans = i;
                }
            }
            return ans;
        }
        void border()
        {
            for (int x = mDepthWidth / 6; x < mDepthWidth * 5 / 6; x++)
                for (int y = mDepthHeight / 6; y < mDepthHeight * 5 / 6; y++)
                    if (mSamplePixels[y * mDepthWidth + x] != kInvalid)
                    {
                        bool isContour = false;
                        int[] dr = { -1, 0, 1 };
                        int[] dc = { -1, 0, 1 };
                        for (int i = 0; i < 3; i++)
                        {
                            for (int j = 0; j < 3; j++)
                            {
                                int dx = x + dr[i], dy = y + dc[j];
                                if (dy * mDepthWidth + dx < 0) continue;
                                if (mSamplePixels[dy * mDepthWidth + dx] == kInvalid) isContour = true;
                            }
                        }
                        if (isContour)  //为边界点
                        {
                            Point p;
                            p.X = x; p.Y = y; p.D = mSamplePixels[y * mDepthWidth + x];
                            mSamplePixels[y * mDepthWidth + x] = kContour;   //边界点，将其颜色该变
                            mContour.Add(p);
                        }
                        else           //为掌心点
                        {
                            Point p;
                            p.X = x; p.Y = y; p.D = mSamplePixels[y * mDepthWidth + x];
                            mHandArea.Add(p);
                            mSamplePixels[y * mDepthWidth + x] = kValid;
                        }
                    }
        }
        bool search_Center()
        {
            if (mHandArea.Count < 20 || mContour.Count < 10) return false;
            int maxDmin = 0;
            foreach (Point pp in mHandArea)
            {
                bool ok = true;
                int dmin = int.MaxValue;
                foreach (Point p in mContour)  //对每个掌心中的点计算其与边界的距离，找出最小的最大点
                {
                    int d = p.GetDistanceExp2(pp);
                    if(d < maxDmin || d < 2)
                    {   
                        ok = false;
                        break;
                    }
                    if (d < dmin) dmin = d;
                }
                if (!ok) continue;
                if (dmin > maxDmin)
                {
                    maxDmin = dmin;
                    mCenter = pp;  //手心坐标
                }
            }
            return true;
        }
        void search_finger()//以手心做半径，寻找指心
        {
            List<int> dists = new List<int>(mContour.Count);
            for (int i = 0; i < mContour.Count; i++)
            {
                dists.Add(mCenter.GetDistanceExp2(mContour[i]));
            }
            int targetDist = (int)(dists.Average());//掌心到边界点的平均值
            if (dists.Max() - dists.Min() <= 1130 - 7 * Dmin) return;
            List<PointWithDist> likely = new List<PointWithDist>();
            for (int i = 0; i < dists.Count; i++)
            {
                if (dists[i] > targetDist)
                {
                    likely.Add(new PointWithDist(mContour[i], dists[i]));
                }
            }
            List<Point> tmpFingers = new List<Point>();
            while (likely.Count != 0)
            {
                int id = S4_FindMax(likely);
                if (likely[id].mPoint.GetDistanceExp2(mCenter) >= 0 && likely[id].mPoint.GetDistanceExp2(mCenter)<=4000) 
                    tmpFingers.Add(likely[id].mPoint);          //手指点找到，放入链表中
                S4_CleanFinger(likely[id], likely);       //递归删除与手指点相联通的点
            }
            for(int i = 0; i < tmpFingers.Count; i++)
            {
                if(mDepthPixels[tmpFingers[i].Y * mDepthWidth + tmpFingers[i].X] < mDepthPixels[mCenter.Y * mDepthWidth + mCenter.X] + 6)
                {
                    mFingers.Add(tmpFingers[i]);
                }
            }
        }
        int S4_FindMax(List<PointWithDist> list)
        {
            int max = 0;
            int id = 0;
            for (int i = 0; i < list.Count; i++)
            {
                if (list[i].mDistance > max)
                {
                    max = list[i].mDistance;
                    id = i;
                }
            }
            return id;
        }
        void S4_CleanFinger(PointWithDist p, List<PointWithDist> list)
        {
            PointWithDist[] sp = new PointWithDist[list.Count];
            int count = 0;
            for (int i = 0; i < list.Count; ++i)
            {
                if (list[i].mPoint.GetDistanceExp2(p.mPoint) <= 9)
                {
                    sp[count] = list[i];
                    list.RemoveAt(i);
                    count++;
                }
            }
            for (int i = 0; i < count; ++i)
            {
                S4_CleanFinger(sp[i], list);
            }
        }

        int cross(int x1, int y1, int x2, int y2) //计算叉积
        {
            return (x1 * y2 - x2 * y1);
        }
        int compare(Point a, Point b)//计算极角
        {
            return cross((b.X - a.X), (b.Y - a.Y), (mCenter.X - a.X), (mCenter.Y - a.Y));
        }
        bool cmp(Point a, Point b)//极角排序
        {
            if (compare(a, b) == 0)//计算叉积，如果叉积相等，按照X从小到大排序
                return a.X < b.X;
            else return compare(a, b) > 0;
        }
        void sort(Point[] m, int len_m)
        {
            for (int i = 0; i < len_m; i++)
            {
                for (int j = i + 1; j < len_m; j++)
                {
                    if (cmp(m[j], m[i]))
                    {
                        Point tmp = m[j];
                        m[j] = m[i];
                        m[i] = tmp;
                    }
                }
            }

        }
    }
}
