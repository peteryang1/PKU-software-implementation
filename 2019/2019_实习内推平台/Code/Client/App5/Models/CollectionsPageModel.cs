using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace App5.Models
{
    public class CollectionsPageModel
    {
        public static List<WorkFile> GetWorkFiles()
        {
            var resumes = new List<Resume>();
            resumes = ResumesDataSource.GetAllResumes().ToList();


            var workFiles = new List<WorkFile>();
            //todo
            return workFiles;
        }

    }

    public class WorkFile
    {
        public int FileId { get; set; }
        public string FileOwner { get; set; }
        public string FileTitle { get; set; }
        public string FileCover { get; set; }
    }
}
