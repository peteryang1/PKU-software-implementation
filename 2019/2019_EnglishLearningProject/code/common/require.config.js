var requireConfig = {
    baseUrl: 'js', // This setting is needed for those modules that are not pre-loaded.
    paths: {
        // Temporarily disabled cdn for jquery and bootstrap.
        // Because bootstrap depends on jquery, but the dependency is not guaranteed
        // if using cdn.
        // Try fix this bug later.
        //"jquery": "http://ajax.aspnetcdn.com/ajax/jQuery/jquery-2.1.4.min",
        //"bootstrap": "http://ajax.aspnetcdn.com/ajax/bootstrap/3.3.5/bootstrap.min",
        // Temporarily disabled knockout because there is slow loading issue.
        //"knockout": "https://ajax.aspnetcdn.com/ajax/knockout/knockout-3.3.0",

        // The following paths are included here ONLY for debugging.
        "require-lib": "../../lib/require",
        "require.config": "../../common/require.config",
        "jquery": "../../lib/jquery",
        "jquery-qrcode": "../../lib/jquery.qrcode.min",
        "datepicker-zh-CN": "../../lib/datepicker-zh-CN",
        "datepicker": "../../lib/datepicker",
        "highcharts": "../../lib/highcharts",
        "swiper": "../../common/swiper.min",
        "minirefresh": "../../common/minirefresh.min",
        "hls": "../../common/hls.min",
        "tcplayer": "../../common/TcPlayer-module",
        "highcharts-more": "../../lib/highcharts-more",
        "orientationchange": "../../lib/events/orientationchange",
        "throttledresize": "../../lib/events/throttledresize",
        "orientation": "../../lib/support/orientation",
        "bootstrap": "../../lib/bootstrap",
        "crossroads": "../../lib/crossroads",
        "hasher": "../../lib/hasher",
        "signals": "../../lib/signals",
        "text": "../../lib/text",
        "underscore": "../../lib/underscore",
        "knockout": "../../lib/knockout",
        "komapping": "../../lib/knockout.mapping",
        "chart": "../../lib/chart",
        "recorder": "../../lib/recorder",
        "recorder-worker": "../../lib/recorderWorker",
        "wx": "../../lib/jweixin-1.3.2",
        "fastclick": "../../lib/fastclick",
        "hammer": "../../lib/hammer",
        "wheel": "../../lib/wheel",
        "wheel-util": "../../lib/wheel-util",
        "utils": "../../common/utils",
        "transition": "../../common/transition",
        "mtutor-service": "../../common/mtutor",
        "audio": "../../common/audio",
        "preloader": "../../common/preloader",
        "loading": "../../common/components/loading/loading",
        "messagebox": "../../common/components/messagebox/messagebox",
        "modeless": "../../common/components/modeless/modeless",
        "audio-controller": "../../common/components/audio-controller",
        "record-controller": "../../common/components/record-controller",
        "voice-controller": "../../common/components/voice-controller",
        "share-curtain": "../../common/components/share-curtain",

        "router": "../../common/router",
        "helper": "../../common/helper",
        "mtutor-client-base": "../../common/mtutor-client-base",

        "stack": "../../common/stack",
        "carousel": "../../common/carousel"
    },
    shim: {
        'highcharts-more': {
            deps: ['highcharts'],
            exports: 'Highcharts'
        },
        'jquery-qrcode': {
            deps:['jquery']
        }
    }
};
