var InteractiveController = {
    MILLISECONDS_IN_A_DAY:  24 * 60 * 60 * 1000,
    DAYS_IN_THE_PAST: 500,
    DAYS_IN_PAST_FOR_DEFAULT: 6,
    MAX_RANGE: 30,
    MIN_RANGE: 2,
    DAYS_FROM_PRESENT: 7,
    slider: null,
    clients: [],
    startDate: null,
    endDate: null,

    setup: function() {
        var MILLISECONDS_IN_THE_PAST = this.DAYS_IN_THE_PAST * this.MILLISECONDS_IN_A_DAY;
        var MILLISECONDS_IN_THE_PAST_DEFAULT = this.DAYS_IN_PAST_FOR_DEFAULT * this.MILLISECONDS_IN_A_DAY;

        $('#slider span').html(moment().subtract(this.DAYS_FROM_PRESENT + this.DAYS_IN_PAST_FOR_DEFAULT, 'days').format('MMMM D, YYYY') + ' - ' + moment().subtract(this.DAYS_FROM_PRESENT, 'days').format('MMMM D, YYYY'));
        this.slider = $("#slider").daterangepicker({
            minDate: moment().subtract(this.DAYS_IN_THE_PAST, 'days'),
            maxDate: moment().subtract(this.DAYS_FROM_PRESENT, 'days'),
            startDate: moment().subtract(this.DAYS_FROM_PRESENT + this.DAYS_IN_PAST_FOR_DEFAULT, 'days'),
            endDate: moment().subtract(this.DAYS_FROM_PRESENT, 'days'),
            timePicker: false,
            dateLimit: {days: this.MAX_RANGE},
            showDropdowns: true,
            opens: 'right',
            ranges: {
               'Last Week': [moment().subtract('days', 13), moment().subtract('days', 7)],
               'Last 30 Days': [moment().subtract('days', 36), moment().subtract('days', 7)],
               'Previous Month': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
            },
        }
        );

        var catClick = function(event) {
                         $(".catSelectorItem").removeClass("active");
                         $(this).parent().addClass("active");
                         $("#categorySelectorButton")
                         .text($('.catSelectorItem.active a').text())
                            .append(' <span class="caret"></span>');
                         missionControl.update(); // keep the page from jumping up
                       };
        $("#categorySelectorButton").text("All Crimes")
            .append(' <span class="caret"></span>');
        var catSelector = $("#categorySelector");
        var catItem = $('<li>', {'class': 'catSelectorItem active'})
                            .append($('<a>', { 'href': '#',
                                                on: {
                                                  click: catClick
                                                }
                                              }).text("All Crimes").data('catID', null));
        catSelector.append(catItem);
        reqMaker.category_list(function (catClick, err, resp) {
            for (var i = 0; i < resp.length; i++) {
                catItem = $('<li>', {'class': 'catSelectorItem'})
                            .append($('<a>', { 'href': '#',
                                                on: {
                                                  click: catClick
                                                }
                                              }).text(resp[i]['name']).data('catID', resp[i]['id']));
                this.append(catItem);
            }
        }.bind(catSelector, catClick));

        // daterangepicker has a bad bug that only sometimes presents and that cuases it to lose its date setting
        // this should be an ugly but functional workaround. I am also migrating functionality into here
        // to consolidate code
        this.startDate = moment().subtract(this.DAYS_FROM_PRESENT + this.DAYS_IN_PAST_FOR_DEFAULT, 'days');
        this.endDate = moment().subtract(this.DAYS_FROM_PRESENT, 'days');
        this.slider
            .on('apply.daterangepicker', function() {
                this.startDate = this.slider.data('daterangepicker').startDate;
                this.endDate = this.slider.data('daterangepicker').endDate;
                $('#slider span').html(this.startDate.format('MMMM D, YYYY') + ' - ' + this.endDate.format('MMMM D, YYYY'))
                this.update();
            }.bind(this));
    },

    addClient: function(clientFunction) {
        this.clients.push(clientFunction);
        // daterangepicker has a bad bug that only sometimes presents and that cuases it to lose its date setting
        // this should be an ugly but functional workaround.
        this.slider.data('daterangepicker').setStartDate(this.startDate)
        this.slider.data('daterangepicker').setEndDate(this.endDate)

        clientFunction(this.slider.data('daterangepicker').startDate.toDate(), 
                       this.slider.data('daterangepicker').endDate.toDate(), 
                       $('.catSelectorItem.active a').data('catID'));
    },

    update: function() {
        // daterangepicker has a bad bug that only sometimes presents and that cuases it to lose its date setting
        // this should be an ugly but functional workaround.
        this.slider.data('daterangepicker').setStartDate(this.startDate)
        this.slider.data('daterangepicker').setEndDate(this.endDate)
        
        for (var i = 0; i < this.clients.length; i++)
            this.clients[i](this.slider.data('daterangepicker').startDate.toDate(), 
                            this.slider.data('daterangepicker').endDate.toDate(), 
                            $('.catSelectorItem.active a').data('catID'));
    }

};
var missionControl;

$().ready(function () {
    missionControl = Object.create(InteractiveController);
    missionControl.setup(); 
});