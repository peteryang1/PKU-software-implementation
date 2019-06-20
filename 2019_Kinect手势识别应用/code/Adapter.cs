using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Kinect;
using System.IO;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows;

namespace HandScannerMk5
{
    class Adapter
    {
        KinectSensor mKinectSensor;
        DepthFrameReader mDepthFrameReader;
        FrameDescription mFrameDescription;
        byte[] mDepthPixels;

        bool mIs15Fps;
        bool mDiscardFrame = false;

        public delegate void FeedPixels(byte[] pixels);

        FeedPixels mFeedPixels;

        // By default, DepthFrameReader works at 30fps.
        // Read the other frame to increase performance.
        public Adapter(bool is15Fps, FeedPixels feedPixels)
        {
            mFeedPixels = feedPixels;

            mIs15Fps = is15Fps;

            mKinectSensor = KinectSensor.GetDefault();

            mDepthFrameReader = mKinectSensor.DepthFrameSource.OpenReader();
            mDepthFrameReader.FrameArrived += DepthFrameReader_FrameArrived;

            mFrameDescription = mKinectSensor.DepthFrameSource.FrameDescription;
            mDepthPixels = new byte[mFrameDescription.Width * mFrameDescription.Height];

            mKinectSensor.Open();
        }

        void DepthFrameReader_FrameArrived(object sender, DepthFrameArrivedEventArgs e)
        {
            using (DepthFrame depthFrame = e.FrameReference.AcquireFrame())
            {
                if (depthFrame != null)
                {
                    if (mIs15Fps)
                    {
                        if (mDiscardFrame)
                        {
                            mDiscardFrame = false;
                            return;
                        }
                        else
                        {
                            mDiscardFrame = true;
                        }
                    }
                    using (KinectBuffer depthBuffer = depthFrame.LockImageBuffer())
                    {
                        if (((mFrameDescription.Width * mFrameDescription.Height) ==
                            (depthBuffer.Size / mFrameDescription.BytesPerPixel)))
                        {
                            ProcessDepthFrameData(depthBuffer);
                            mFeedPixels(mDepthPixels);
                        }
                    }
                }
            }
        }
        unsafe void ProcessDepthFrameData(KinectBuffer depthBuffer)
        {
            ushort* frameData = (ushort*)depthBuffer.UnderlyingBuffer;
            uint size = depthBuffer.Size;

            for (uint i = 0; i < (size / mFrameDescription.BytesPerPixel); ++i)
            {
                // 16bit ushort
                // 15-3 depth data in mm
                // 2-0 body index
                
                // cast ushort to byte -> pixels are in Range(0-2.04m?)
                // (16320 >> 3) -> 2040mm -> 2.04m
                // 0==0m 255==2.04m
                
                // consider to replace byte[] to int[] to improve performance
                
                // ushort depth = frameData[i];
                uint depth = frameData[i];

                mDepthPixels[i] = (byte)((depth > 2040) ? 255 : (depth >> 4));

            }
        }
        /*
        public void SaveBitmap(string path)
        {
            var bitmap = new WriteableBitmap(mFrameDescription.Width, mFrameDescription.Height, 96.0, 96.0, PixelFormats.Gray8, null);
            bitmap.WritePixels(
                new Int32Rect(0, 0, bitmap.PixelWidth, bitmap .PixelHeight),
                mDepthPixels,
                bitmap.PixelWidth,
                0);

            var stream = new FileStream(path, FileMode.CreateNew);

            var encoder = new PngBitmapEncoder();
            encoder.Frames.Add(BitmapFrame.Create(bitmap));

            encoder.Save(stream);

            stream.Close();
        }

        public static byte[] LoadBitmap(string path)
        {
            var stream = new FileStream(path, FileMode.Open);

            var decoder = new PngBitmapDecoder(stream, BitmapCreateOptions.None, BitmapCacheOption.None);
            var frame = decoder.Frames[0];
            var bytes = new byte[frame.PixelWidth * frame.PixelHeight];
            frame.CopyPixels(bytes, frame.PixelWidth, 0);

            stream.Close();

            return bytes;
        }
        //*/
    }
}
