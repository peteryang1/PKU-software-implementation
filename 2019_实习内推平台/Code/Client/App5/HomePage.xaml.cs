
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using App5.Models;
using App5.ViewModels;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.System;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Media.Animation;
using Windows.UI.Xaml.Navigation;

namespace App5
{
    public sealed partial class HomePage : Page
    {
        private ResumeViewModel _lastSelectedItem;

        public HomePage()
        {
            this.InitializeComponent();
        }

        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            base.OnNavigatedTo(e);

            var items = MasterListView.ItemsSource as List<ResumeViewModel>;

            if (items == null) {
                items = new List<ResumeViewModel>();

                foreach (var item in ResumesDataSource.GetAllResumes()) {
                    items.Add(ResumeViewModel.FromItem(item));
                }

                MasterListView.ItemsSource = items;
            }

            if (e.Parameter != null) {
                // Parameter is item ID
                var id = (int)e.Parameter;
                _lastSelectedItem =
                    items.Where((item) => item.ResumeId == id).FirstOrDefault();
            }

            UpdateForVisualState(AdaptiveStates.CurrentState);

            // Don't play a content transition for first item load.
            // Sometimes, this content will be animated as part of the page transition.
            DisableContentTransitions();
        }

        private void AdaptiveStates_CurrentStateChanged(object sender, VisualStateChangedEventArgs e)
        {
            UpdateForVisualState(e.NewState, e.OldState);
        }

        private void UpdateForVisualState(VisualState newState, VisualState oldState = null)
        {
            var isNarrow = newState == NarrowState;

            if (isNarrow && oldState == DefaultState && _lastSelectedItem != null) {
                // Resize down to the detail item. Don't play a transition.
                Frame.Navigate(typeof(HomeDetailPage), _lastSelectedItem.ResumeId, new SuppressNavigationTransitionInfo());
            }

            EntranceNavigationTransitionInfo.SetIsTargetElement(MasterListView, isNarrow);
            if (DetailContentPresenter != null) {
                EntranceNavigationTransitionInfo.SetIsTargetElement(DetailContentPresenter, !isNarrow);
            }
        }

        private void MasterListView_ItemClick(object sender, ItemClickEventArgs e)
        {
            var clickedItem = (ResumeViewModel)e.ClickedItem;
            _lastSelectedItem = clickedItem;

            if (AdaptiveStates.CurrentState == NarrowState) {
                // Use "drill in" transition for navigating from master list to detail view
                Frame.Navigate(typeof(HomeDetailPage), clickedItem.ResumeId, new DrillInNavigationTransitionInfo());
            } else {
                // Play a refresh animation when the user switches detail items.
                EnableContentTransitions();
            }
        }

        private void LayoutRoot_Loaded(object sender, RoutedEventArgs e)
        {
            // Assure we are displaying the correct item. This is necessary in certain adaptive cases.
            MasterListView.SelectedItem = _lastSelectedItem;
        }

        private void EnableContentTransitions()
        {
            DetailContentPresenter.ContentTransitions.Clear();
            DetailContentPresenter.ContentTransitions.Add(new EntranceThemeTransition());
        }

        private void DisableContentTransitions()
        {
            if (DetailContentPresenter != null) {
                DetailContentPresenter.ContentTransitions.Clear();
            }
        }

        private void TextBlock_Tapped(object sender, TappedRoutedEventArgs e)
        {
            var btn = sender as TextBlock;
            FeedbackAsync(btn.Text);
        }
        public async void FeedbackAsync(string address)
        {
            if (address == null)
                return;
            var mailto = new Uri($"mailto:{address}");
            await Launcher.LaunchUriAsync(mailto);
        }
    }
}
