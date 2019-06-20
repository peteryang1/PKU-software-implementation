using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace App5.Models
{
    public class Resume
    {
        public int Rid { get; set; }
        public string Title { get; set; }
        public string Text { get; set; }
        public string Company { get; set; }
        public string Cover { get; set; }
        public string Email { get; set; }
        public DateTime DateCreated { get; set; }
    }
}
