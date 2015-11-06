define(['common/js/spec_helpers/ajax_helpers', 'js/ccx/schedule'],
    function(AjaxHelpers) {
        describe("edx.ccx.schedule.ScheduleView", function() {
            var view = null;

            beforeEach(function() {
                loadFixtures("js/fixtures/ccx/schedule.html");

                var scheduleFixture = readFixtures("templates/ccx/schedule.underscore");
                appendSetFixtures("<div id=\"schedule_template\">" + scheduleFixture + "</div>");
                schedule_template = _.template($('#schedule_template').html());
                save_url = 'save_ccx';

                $.fn.leanModal = function(param) {
                    return true;
                }

                data = [{
                    "category": "chapter",
                    "display_name": "Introduction",
                    "due": null,
                    "start": null,
                    "location": "i4x://edX/DemoX/chapter/d8a6192ade314473a78242dfeedfbf5b",
                    "hidden": true,
                    "children": [
                        {
                        "category": "sequential",
                        "display_name": "Demo Course Overview",
                        "due": null,
                        "start": null,
                        "location": "i4x://edX/DemoX/sequential/edx_introduction",
                        "hidden": true,
                        "children": [
                            {
                            "category": "vertical",
                            "display_name": "Introduction: Video and Sequences",
                            "due": null,
                            "start": null,
                            "location": "i4x://edX/DemoX/vertical/vertical_0270f6de40fc",
                            "hidden": true
                            }
                        ]
                        }
                    ]
                }];
                view = new edx.ccx.schedule.ScheduleView({el: $('#new-ccx-schedule')});
                view.schedule_collection.set(data)
                view.render();


            });

            it("verifies correct view setup", function() {
                expect(view.dirty).toBe(false);
                expect(view.showing).toEqual([]);
                expect(view.hidden).toEqual(data);
                expect(view.schedule).toEqual(data);
            });

            it("finds a unit", function() {
                var unit = view.find_unit(view.schedule, 'i4x://edX/DemoX/chapter/d8a6192ade314473a78242dfeedfbf5b');
                expect(unit).toEqual(data[0]);
            });

            it("hides a unit", function() {
                var unit = view.find_unit(view.schedule, 'i4x://edX/DemoX/chapter/d8a6192ade314473a78242dfeedfbf5b');
                unit.hidden = false;
                view.hide(unit);
                expect(unit.hidden).toBe(true);
            });

            it("shows a unit", function() {
                var unit = view.find_unit(view.schedule, 'i4x://edX/DemoX/chapter/d8a6192ade314473a78242dfeedfbf5b');
                view.show(unit);
                expect(unit.hidden).toBe(false);
            });

            it("applies function to schedule nodes", function() {
                var unit = view.find_unit(view.schedule, 'i4x://edX/DemoX/chapter/d8a6192ade314473a78242dfeedfbf5b');
                expect(unit.hidden).toBe(true);
                view.schedule_apply(view.schedule, view.show)
                expect(unit.hidden).toBe(false);
            });

            it("adds all units to schedule", function() {
                expect(view.showing).toEqual([]);
                expect(view.hidden.length).toEqual(1);
                $('#add-all').click();
                expect(view.showing.length).toEqual(1);
                expect(view.hidden).toEqual([]);
            });

            it("selects a chapter and adds units to dropdown", function() {
                expect(view.sequential_select.children('option').length).toEqual(0);
                view.chapter_select.change();
                expect(view.sequential_select.prop('disabled')).toEqual(true);
                var val = 'i4x://edX/DemoX/chapter/d8a6192ade314473a78242dfeedfbf5b';
                view.chapter_select.val(val);
                view.chapter_select.change();
                expect(view.chapter_select.val()).toEqual(val);
                expect(view.sequential_select.prop('disabled')).toEqual(false);
                expect(view.sequential_select.children('option').length).toEqual(2);
            });

            it("selects a unit and adds sections to dropdown", function() {
                var val = 'i4x://edX/DemoX/chapter/d8a6192ade314473a78242dfeedfbf5b';
                view.chapter_select.val(val);
                view.chapter_select.change();
                expect(view.vertical_select.children('option').length).toEqual(0);
                view.sequential_select.change();
                expect(view.vertical_select.prop('disabled')).toEqual(true);
                val = "i4x://edX/DemoX/sequential/edx_introduction";
                view.sequential_select.val(val);
                view.sequential_select.change();
                expect(view.sequential_select.val()).toEqual(val);
                expect(view.vertical_select.prop('disabled')).toEqual(false);
                expect(view.vertical_select.children('option').length).toEqual(2);
            });

            it("selects a section", function() {
                var val = 'i4x://edX/DemoX/chapter/d8a6192ade314473a78242dfeedfbf5b';
                view.chapter_select.val(val);
                view.chapter_select.change();
                val = "i4x://edX/DemoX/sequential/edx_introduction";
                view.sequential_select.val(val);
                view.sequential_select.change();
                val = "i4x://edX/DemoX/vertical/vertical_0270f6de40fc",
                view.vertical_select.val(val);
                view.vertical_select.change();
                expect(view.vertical_select.val()).toEqual(val);
            });

            it("adds a unit", function() {
                var val = 'i4x://edX/DemoX/chapter/d8a6192ade314473a78242dfeedfbf5b';
                view.chapter_select.val(val);
                view.chapter_select.change();
                val = "i4x://edX/DemoX/sequential/edx_introduction";
                view.sequential_select.val(val);
                view.sequential_select.change();
                val = "i4x://edX/DemoX/vertical/vertical_0270f6de40fc",
                view.vertical_select.val(val);
                view.vertical_select.change();
                var unit = view.find_unit(view.schedule, 'i4x://edX/DemoX/chapter/d8a6192ade314473a78242dfeedfbf5b');
                expect(unit.hidden).toBe(true);
                $('#add-unit-button').click();
                expect(unit.hidden).toBe(false);
            });

            it("gets a datetime string from date and time fields", function() {
                view.set_datetime('start', '2015-12-12 10:45');
                expect($('form#add-unit input[name=start_date]')).toHaveValue('2015-12-12');
                expect($('form#add-unit input[name=start_time]')).toHaveValue('10:45');
            });

            it("sets date and time fields from datetime string", function() {
                $('form#add-unit input[name=start_date]').val('2015-12-12');
                $('form#add-unit input[name=start_time]').val('10:45');
                var datetime = view.get_datetime('start');
                expect(datetime).toBe('2015-12-12 10:45');
            });

            it("saves schedule changes", function() {
                requests = AjaxHelpers["requests"](this)
                view.save();
                expect(requests.length).toEqual(1)
                AjaxHelpers.expectJsonRequest(requests, 'POST', 'save_ccx', view.schedule);
                expect($('#dirty-schedule #save-changes').text()).toEqual("Saving...");
                AjaxHelpers.respondWithJson(requests, {
                    data: view.schedule
                });
                expect($('#dirty-schedule #save-changes').text()).toEqual("Save changes");
                expect($('#ajax-error')).toHaveCss({display: 'none'});
            });

            it("displays an error if the sync fails", function() {
                requests = AjaxHelpers["requests"](this)
                view.save();
                requests[0].respond(500);
                expect($('#ajax-error')).toHaveCss({display: 'block'});
            });

        });
    }
);
