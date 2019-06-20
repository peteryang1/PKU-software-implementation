using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Models
{
    public class Person
    {
        [Key] public int Pid { get; set; }
        public string Name { get; set; }
        public string School { get; set; }
        public string Email { get; set; }
    }
}
