using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Models
{
    public class Resume
    {
        [Key] public int Rid { get; set; }
        public int Pid { get; set; }
        public string Path { get; set; }
        public string School { get; set; }
        public string Title { get; set; }
        public string Company { get; set; }
        public string Salary { get; set; }
    }
}
