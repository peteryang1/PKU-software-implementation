using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace App5.Models
{
    public class GetProfileModel
    {
        public ProfilePageModel ProfilePageModel { get; } = new ProfilePageModel("Jerry Ma", "PKU");
    }

    public class ProfilePageModel
    {
        public ProfilePageModel(string _userName, string _university)
        {
            UserName = _userName;
            University = _university;
        }
        public string UserName { get; set; }
        public string University { get; set; }
    }
}
