using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LostAndFound.Models
{
    public class UserInfo
    {
        public string phonenumber { get; set; }//c#语法，表示该属性可读可写
        public int credit { get; set; }
        public int score { get; set; }
        public string portrait { get; set; }
    }
    //从服务器端获取的数据进行绑定
    public class userInfoManager
    {
        public static int GetUserInfos()
        {
            var userinfos = 1;
            return userinfos;
        }
        
    }
}
