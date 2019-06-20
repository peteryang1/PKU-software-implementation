using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend
{
    public class WEBAPIDbContext : DbContext
    {
        public WEBAPIDbContext(DbContextOptions<WEBAPIDbContext> options) : base(options) { }

        public DbSet<Person> Persons { get; set; }
        public DbSet<Resume> Resumes { get; set; }

    }
}
