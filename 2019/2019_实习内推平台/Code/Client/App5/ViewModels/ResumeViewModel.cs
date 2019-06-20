using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using App5.Models;
using Windows.Globalization.DateTimeFormatting;

namespace App5.ViewModels
{
    public class ResumeViewModel
    {
        private int _resumeId;

        public int ResumeId
        {
            get
            {
                return _resumeId;
            }
        }

        public string DateCreatedHourMinute
        {
            get
            {
                var formatter = new DateTimeFormatter("hour minute");
                return formatter.Format(DateCreated);
            }
        }

        public string Title { get; set; }
        public string Text { get; set; }
        public DateTime DateCreated { get; set; }
        public string Company { get; set; }
        public string Cover { get; set; }
        public string Email { get; set; }

        public ResumeViewModel()
        {
        }

        public static ResumeViewModel FromItem(Resume item)
        {
            var viewModel = new ResumeViewModel();

            viewModel._resumeId = item.Rid;
            viewModel.DateCreated = item.DateCreated;
            viewModel.Title = item.Title;
            viewModel.Text = item.Text;
            viewModel.Company = item.Company;
            viewModel.Cover = item.Cover;
            viewModel.Email = item.Email;

            return viewModel;
        }
    }
}
