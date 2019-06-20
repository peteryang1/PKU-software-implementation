using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace App5.Models
{
    public class ResumesDataSource
    {
        private static List<Resume> _resumes = new List<Resume>()
        {
            new Resume()
            {
           //todo
            }
        };

        public static IList<Resume> GetAllResumes()
        {
            return _resumes;
        }

        public static Resume GetResumeById(int id)
        {
            return _resumes[id];
        }
    }
}
