using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [Produces("application/json")]
    [ApiController]
    public class PersonController : ControllerBase
    {
        private WEBAPIDbContext _pcontext;

        public PersonController(WEBAPIDbContext context)
        {
            this._pcontext = context;

            if (_pcontext.Persons.Count() == 0) {
                _pcontext.Persons.Add(new Person { Name = "Jerry", School = "PKU", Email = "jerrymax.jm@outlook.com" });
                _pcontext.SaveChanges();
            }
        }

        [HttpGet]
        public IEnumerable<Person> GetAll()
        {
            return _pcontext.Persons.ToList();
        }
    }
}