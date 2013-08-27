var CANVAS_WIDTH = 300;
var CANVAS_HEIGHT = 300;
var ANIM_TIME = 200;
var canvas;


//////MODELS

var Settings = Backbone.Model.extend({
    objects: null,
    default: {
        count: 5,
        placement: "circle", //one, random, circle
        angle: 0,
        color: "rgba(0, 0, 0, 0)",
        opacity: 1,
        overlay: null,
        angle_delta: 0,
        offset: 0,
        grid: 9, //9, 25, 49
        x: 0,
        y: 0,
        radius: 40
    },
    range: {
        angle: {
            min: -180,
            step: 1,
            max: 180
        },
        offset: {
            min: 0,
            step: 1,
            max: 360
        },
        opacity: {
            min: 0,
            step: 0.01,
            max: 1
        },
        width: {
            min: 0,
            step: 1
        },
        height: {
            min: 0,
            step: 1
        },
        count: {
            min: 1,
            step: 1,
            max: 20
        },
        placement: {
            values: ["one", "random", "circle"]
        },
        angle_delta: {
            min: 0,
            step: 1,
            max: 360
        },
        grid: {
            values: [9, 25, 49, 81]
        },
        x: {
            step: 1
        },
        y: {
            step: 1
        },
        radius: {
            min: 0,
            step: 1
        }
    },
    initialize: function () {
        this.set_range();
        this.objects = new Backbone.Collection([], {model: GridSettings});
        this.set({id: _.random(0, 1000000)});
        /*ratio height witdh init*/
        var w = Math.min(this.get("img").width, this.range.width.max / 2),
            h = Math.min(this.get("img").height, this.range.height.max / 2),
            r = this.get("img").width / this.get("img").height;
        this.set({width: Math.min(w, h * r), height: Math.min(h, w / r)});
        this.set(this.default);
        for (var i = 0; i < this.range.count.max; i++)
            this.objects.add({
                x: this.get("x"),
                y: this.get("y"),
                angle: this.get("angle"),
                opacity: this.get("opacity"),
                grid: this.get("grid"),
                height: this.get("height"),
                width: this.get("width"),
                img: this.get("img")
            });
        this.change_layout();
        this.layout();
        this.bind("change", this.layout);
        this.bind("change:placement", this.change_layout);
        this.bind("reinitialize", this.reinitialize);
    },
    set_range: function () {
        this.range.width.max = canvas.getWidth() * 2;
        this.range.height.max = canvas.getHeight() * 2;
        this.range.x.max = Math.round(canvas.getWidth() / 2);
        this.range.x.min = -Math.round(canvas.getWidth() / 2);
        this.range.y.max = Math.round(canvas.getHeight() / 2);
        this.range.y.min = -Math.round(canvas.getHeight() / 2);
        this.range.radius.max = Math.min(canvas.getHeight(), canvas.getWidth()) * 2;
    },
    change_layout: function () {
        var i;
        this.layout = this.layouts[this.get("placement")];
        //specific preparations
        switch (this.get("placement")) {
            case "one":
                this.objects.at(0).visible(true);
                for (i = 1; i < this.objects.length; i++)
                    this.objects.at(i).visible(false);
                break;
            case "random":
                var data = [], r = this.range;
                for (i = 0; i < this.objects.length; i++)
                    data[i] = {
                        x: _.random(r.x.min, r.x.max),
                        y: _.random(r.y.min, r.y.max),
                        angle: _.random(r.angle.min, r.angle.max)
                    };
                for (i = 0; i < this.objects.length; i++)
                    this.objects.at(i).set(data[i]);
                break;
        }
        this.unbind("change");
        this.bind("change", this.layouts[this.get("placement")]);
    },
    layouts: {
        one: function () {
            console.log("one");
            var x = this.get("x"),
                y = this.get("y"),
                angle = this.get("angle"),
                opacity = this.get("opacity"),
                grid = this.get("grid"),
                height = this.get("height"),
                width = this.get("width");
            var data = {
                x: x,
                y: y,
                angle: angle,
                opacity: opacity,
                grid: grid,
                height: height,
                width: width
            };
            this.objects.at(0).set(data);
            //canvas.renderAll();
            update_canvas();
        },
        random: function () {
            console.log("random");
            var count = this.get("count"),
                opacity = this.get("opacity"),
                grid = this.get("grid"),
                height = this.get("height"),
                width = this.get("width"),
                i, data = [];
            for (i = 0; i < count; i++)
                data[i] = {
                    opacity: opacity,
                    grid: grid,
                    height: height,
                    width: width
                };
            for (i = 0; i < this.objects.length; i++)
                this.objects.at(i).set(data[i]).visible(true);
            for (i = count; i < this.objects.length; i++)
                this.objects.at(i).visible(false);
            //canvas.renderAll();
            update_canvas();

        },
        circle: function () {
            console.log("circle");
            var count = this.get("count"),
                delta = 360 / count,
                offset = this.get("offset"),
                radius = this.get("radius"),
                x = this.get("x"),
                y = this.get("y"),
                angle = this.get("angle"),
                angle_delta = this.get("angle_delta"),
                opacity = this.get("opacity"),
                grid = this.get("grid"),
                height = this.get("height"),
                width = this.get("width"),
                i, data = [];
            for (i = 0; i < count; i++)
                data[i] = {
                    x: x + radius * Math.sin(Math.PI * (offset + delta * i) / 180),
                    y: y + radius * Math.cos(Math.PI * (offset + delta * i) / 180),
                    angle: angle + angle_delta * i,
                    opacity: opacity,
                    grid: grid,
                    height: height,
                    width: width
                };
            for (i = 0; i < this.objects.length; i++)
                this.objects.at(i).set(data[i]).visible(true);
            for (i = count; i < this.objects.length; i++)
                this.objects.at(i).visible(false);

            //canvas.renderAll();
            update_canvas();
        }
    },
    randomize: function () {
        var r = this.range, data = {};
        data.count = _.random(r.count.min, r.count.max);
        data.placement = r.placement.values[_.random(0, r.placement.values.length - 1)];
        data.angle = _.random(r.angle.min, r.angle.max);
        data.opacity = _.random(r.opacity.min / r.opacity.step, r.opacity.max / r.opacity.step) * r.opacity.step;
        data.angle_delta = _.random(r.angle_delta.min, r.angle_delta.max);
        data.offset = _.random(r.offset.min, r.offset.max);
        data.grid = r.grid.values[_.random(0, r.grid.values.length - 1)];
        data.width = _.random(r.width.min, r.width.max);
        data.height = _.random(r.height.min, r.height.max);
        data.x = _.random(r.x.min, r.x.max);
        data.y = _.random(r.y.min, r.y.max);
        data.radius = _.random(r.radius.min, r.radius.max);
        this.set(data, {silent: true});
        this.change_layout();
        this.layout();
    },
    reinitialize: function () {
        for (var i = 0; i < this.objects.length; i++)
            this.objects.at(i).trigger("reinitialize");
    }
});

var GridSettings = Backbone.Model.extend({ //must render grid
    fabric_objects: null,
    default: {
        grid: 9,
        x: 0,
        y: 0,
        opacity: 1,
        angle: 0
    },
    initialize: function () {
        this.fabric_objects = new Backbone.Collection([], {model: FabricObject});
        //TODO:remove hardcoded value 81
        for (var i = 0; i < 81; i++)
            this.fabric_objects.add(this.attributes);
        this.grid_size();
        this.grid_position();
        this.bind("change:grid", this.grid_size);
        this.bind("change:grid change:x change:y", this.grid_position);
        this.bind("change:grid change:width change:height change:angle change:opacity", this.params_change);
        this.bind("reinitialize", this.reinitialize);
    },
    params_change: function () {
        var data = {}, i, size = this.get("grid");
        data.width = this.get("width");
        data.height = this.get("height");
        data.opacity = this.get("opacity");
        data.angle = this.get("angle");
        for (i = 0; i < size; i++)
            this.fabric_objects.at(i).set(data);
    },
    grid_position: function () {
        var g = this.get("grid"),
            x = this.get("x"),
            y = this.get("y"),
            len = Math.sqrt(g),
            step_x = canvas.getWidth() / ((len - 1) / 2),
            step_y = canvas.getHeight() / ((len - 1) / 2), i;
        for (i = 0; i < len; i++)
            for (var j = 0; j < len; j++)
                this.fabric_objects.at(i * len + j).set({
                    x: x - canvas.getWidth() + j * step_x,
                    y: y - canvas.getHeight() + i * step_y
                });
    },
    grid_size: function () {
        var g = this.get("grid"), i;
        for (i = 0; i < g; i++)
            this.fabric_objects.at(i).set({show: true});
        for (i = g; i < this.fabric_objects.length; i++)
            this.fabric_objects.at(i).set({show: false});
    },
    visible: function (isVisible) {
        var g = this.get("grid"), i;
        for (i = 0; i < g; i++)
            this.fabric_objects.at(i).set({show: isVisible});
    },
    reinitialize: function () {
        for (var i = 0; i < this.fabric_objects.length; i++)
            this.fabric_objects.at(i).trigger("reinitialize");
    }
});

var FabricObject = Backbone.Model.extend({ //must render grid
    _fabric: null,
    default: {
        show: false
    },
    initialize: function () {
        this._fabric = new fabric.Image(this.get("img"), {visible: this.get("show")});
        this.add();
        this.bind("change", this.render);
        this.bind("change:show", this.show);
        this.bind("reinitialize", this.add);
    },
    add: function () {
        canvas.add(this._fabric);
    },
    show: function () {
        //TODO: strange optimization think about it
        /*
        if (this.get("show") && this._fabric.intersectsWithRect(new fabric.Point(0, 0), new fabric.Point(canvas.width, canvas.height)))
            this._fabric.set("visible", this.get("show"));
        else
            this._fabric.set("visible", false);*/
        this._fabric.set("visible", this.get("show"));
    },
    render: function () {
        this._fabric.set({
            left: canvas.getCenter().left + this.get("x"),
            top: canvas.getCenter().top - this.get("y"),
            width: this.get("width"),
            height: this.get("height"),
            angle: this.get("angle"),
            opacity: this.get("opacity")
        });
    }
});

//////COLLECTION

var SettingsCollection = Backbone.Collection.extend({
    model: Settings,
    initialize: function () {
        this.bind("add", this.add_model);
        this.bind("remove", this.remove_model);
        //this.on("change", this.render);
    },
    add_model: function (model) {
        var view = new SettingsView({model: model});
        view.render().place().init_controls();
    },
    remove_model: function (model) {
        canvas._objects = [];
        for (var i = 0; i < this.length; i++)
            this.at(i).trigger("reinitialize");
        update_canvas();

    }
});

//////VIEW

var SettingsView = Backbone.View.extend({
    tagName: "div",
    className: "row pattern-part",
    template: _.template($("#part-settings-tmpl").html()),
    allowed_keys: [],
    init_controls: function () {
        //console.log(this.model.attributes);
        this.$el.find('.colorpicker').colorpicker({format: "rgba"});
        this.$el.find('input.grid-of-obj[value=' + this.model.get('grid') + ']').attr('checked', true);
        this.$el.find('input.placement-of-obj[value=' + this.model.get('placement') + ']').attr('checked', true);
        switch (this.$el.find('.placement input:checked').val()) {
            case "one":
                this.$el.find('.form-group.x').show();
                this.$el.find('.form-group.y').show();
                this.$el.find('.form-group.angle').show();
                this.$el.find('.form-group.count').hide();
                this.$el.find('.form-group.offset').hide();
                this.$el.find('.form-group.angle-delta').hide();
                this.$el.find('.form-group.radius').hide();
                this.$el.find('.form-group.placement button.rndmz').hide();
                break;
            case "random":
                this.$el.find('.form-group.x').hide();
                this.$el.find('.form-group.y').hide();
                this.$el.find('.form-group.angle').hide();
                this.$el.find('.form-group.count').show();
                this.$el.find('.form-group.offset').hide();
                this.$el.find('.form-group.angle-delta').hide();
                this.$el.find('.form-group.radius').hide();
                this.$el.find('.form-group.placement button.rndmz').show();
                break;
            case "circle":
                this.$el.find('.form-group.x').show();
                this.$el.find('.form-group.y').show();
                this.$el.find('.form-group.angle').show();
                this.$el.find('.form-group.count').show();
                this.$el.find('.form-group.offset').show();
                this.$el.find('.form-group.angle-delta').show();
                this.$el.find('.form-group.radius').show();
                this.$el.find('.form-group.placement button.rndmz').hide();
                break;
        }

        this.setup_allowed_keys();
        this.$el.find("div.slider").each(_.bind(function (n, slider) {
            var p_name = $(slider).attr("data-option");
            $(slider).parent().parent().find("input").val(this.get(p_name));
            $(slider).slider({
                animate: ANIM_TIME,
                min: this.range[p_name].min,
                max: this.range[p_name].max,
                step: this.range[p_name].step,
                value: this.get(p_name),
                range: "min"
            });
        }, this.model));
        return this;
    },
    change_settings_order: function () {
        switch (this.$el.find('.placement input:checked').val()) {
            case "one":
                this.$el.find('.form-group.x').slideDown(ANIM_TIME);
                this.$el.find('.form-group.y').slideDown(ANIM_TIME);
                this.$el.find('.form-group.angle').slideDown(ANIM_TIME);
                this.$el.find('.form-group.count').slideUp(ANIM_TIME);
                this.$el.find('.form-group.offset').slideUp(ANIM_TIME);
                this.$el.find('.form-group.angle-delta').slideUp(ANIM_TIME);
                this.$el.find('.form-group.radius').slideUp(ANIM_TIME);
                this.$el.find('.form-group.placement button.rndmz').hide();
                break;
            case "random":
                this.$el.find('.form-group.x').slideUp(ANIM_TIME);
                this.$el.find('.form-group.y').slideUp(ANIM_TIME);
                this.$el.find('.form-group.angle').slideUp(ANIM_TIME);
                this.$el.find('.form-group.count').slideDown(ANIM_TIME);
                this.$el.find('.form-group.offset').slideUp(ANIM_TIME);
                this.$el.find('.form-group.angle-delta').slideUp(ANIM_TIME);
                this.$el.find('.form-group.radius').slideUp(ANIM_TIME);
                this.$el.find('.form-group.placement button.rndmz').show();
                break;
            case "circle":
                this.$el.find('.form-group.x').slideDown(ANIM_TIME);
                this.$el.find('.form-group.y').slideDown(ANIM_TIME);
                this.$el.find('.form-group.angle').slideDown(ANIM_TIME);
                this.$el.find('.form-group.count').slideDown(ANIM_TIME);
                this.$el.find('.form-group.offset').slideDown(ANIM_TIME);
                this.$el.find('.form-group.angle-delta').slideDown(ANIM_TIME);
                this.$el.find('.form-group.radius').slideDown(ANIM_TIME);
                this.$el.find('.form-group.placement button.rndmz').hide();
                break;
        }
    },
    place: function () {
        //var last = $('.control-panel > .row.pattern-part').last();
        this.$el.hide();
        $('.control-panel > .row:first-child').after(this.$el);
        this.$el.slideDown(ANIM_TIME);
        return this;
    },
    render: function () {
        this.$el.html(this.template(this.model.attributes));
        return this;
    },
    events: {
        "click button.delete": "remove",
        "click button.rndmz": "generate_random_layout",
        "change input[type=radio]": "radio_changed",
        "change input.placement-of-obj": "change_settings_order",
        "changeColor input.colorpicker": "color_changed",
        "click button.random": "random",
        "slide .slider": "onslide",
        "input input": "oninput",
        "keypress input": "filter_number",
        "keydown input": "up_and_down"

    },
    setup_allowed_keys: function () {
        this.allowed_keys.push(45, 46); //minus and dot
        this.allowed_keys.push(48, 49, 50, 51, 52, 53, 54, 55, 56, 57); //0-9
    },
    up_and_down: function (e) {
        var key = e.keyCode;
        if (key != 38 && key != 40)
            return;
        var val = parseInt($(e.target).val() * 10000);
        var slider = $(e.target).parent().find(".slider");
        var slider_options = slider.slider("option");
        var step = slider_options.step * 10000;
        var ost = val % step;
        if (key == 38) { //key up
            if (ost)
                val += step - Math.abs(ost);
            else
                val += step;
        } else if (key == 40) {  //key down
            if (ost)
                val -= ost;
            else
                val -= step;
        }
        val /= 10000;
        val = Math.max(val, slider_options.min);
        val = Math.min(val, slider_options.max);
        $(e.target).val(val);
        slider.slider("value", val);
        this.save(slider.attr("data-option"));
    },
    filter_number: function (e) {
        var key = e.keyCode;
        if (!_.contains(this.allowed_keys, key))
            e.preventDefault();
        else if (key == 46 && $(e.target).val().match(/\./g))
            e.preventDefault();
        else if (key == 45 && $(e.target).val().match(/[-]/g))
            e.preventDefault();

    },
    oninput: function (e) {
        var slider = $(e.target).parent().find(".slider");
        var opt = slider.slider("option");
        var value = $(e.target).val();
        if (value == "") value = 0;
        if (isInt(opt.step))
            value = parseInt(value);
        else
            value = parseFloat(value);
        if (isNaN(value)) {
            event.preventDefault();
            return;
        }
        if (value < opt.min) {
            slider.slider("value", opt.min);
            $(e.target).val(opt.min);
        } else if (value > opt.max) {
            slider.slider("value", opt.max);
            $(e.target).val(opt.max);
        } else
            slider.slider("value", value);
        this.save(slider.attr("data-option"));
    },
    generate_random_layout: function () {
        this.model.change_layout();
        update_canvas();
    },
    random: function () {
        this.$el.find("button.random").attr("disabled", true);
        this.model.randomize();
        var v = this.model.attributes;
        this.$el.find('.form-group.angle .slider').slider("option", "value", v.angle);
        this.$el.find('.form-group.angle input').val(v.angle);
        this.$el.find('.form-group.opacity .slider').slider("option", "value", v.opacity);
        this.$el.find('.form-group.opacity input').val(v.opacity);
        this.$el.find('.form-group.width .slider').slider("option", "value", v.width);
        this.$el.find('.form-group.width input').val(v.width);
        this.$el.find('.form-group.height .slider').slider("option", "value", v.height);
        this.$el.find('.form-group.height input').val(v.height);
        this.$el.find('.form-group.count .slider').slider("option", "value", v.count);
        this.$el.find('.form-group.count input').val(v.count);
        this.$el.find('.form-group.x .slider').slider("option", "value", v.x);
        this.$el.find('.form-group.x input').val(v.x);
        this.$el.find('.form-group.y .slider').slider("option", "value", v.y);
        this.$el.find('.form-group.y input').val(v.y);
        this.$el.find('.form-group.radius .slider').slider("option", "value", v.radius);
        this.$el.find('.form-group.radius input').val(v.radius);
        this.$el.find('.form-group.offset .slider').slider("option", "value", v.offset);
        this.$el.find('.form-group.offset input').val(v.offset);
        this.$el.find('.form-group.angle-delta .slider').slider("option", "value", v.angle_delta);
        this.$el.find('.form-group.angle-delta input').val(v.angle_delta);
        this.$el.find('.form-group.placement input[value=' + v.placement + ']').prop('checked', true);
        this.$el.find('.form-group.grid input[value=' + v.grid + ']').prop('checked', true);
        this.change_settings_order();
        //  canvas.renderAll();
        this.$el.find("button.random").attr("disabled", false);
    },
    onslide: function (e, o) {
        $(e.target).parent().parent().find("input").val(o.value);
        this.save($(e.target).attr("data-option"));
    },
    save: function (p_name) {
        var val = this.$el.find("input[data-option=" + p_name + "]").val();
        if (val == "") val = this.model.default[p_name];
        this.model.set(p_name, parseFloat(val));
        //console.log(this.model.attributes);
    },
    remove: function () {
        parts.remove(this.model);
        this.$el.slideUp(ANIM_TIME, function () {
            $(this).remove()
        });
    },
    radio_changed: function (ev) {
        var p_name = $(ev.target).attr("class").replace("-of-obj", "").replace("-", "_");
        if (p_name == "grid")
            this.model.set(p_name, parseInt($(ev.target).val()));
        else if (p_name == "placement")
            this.model.set(p_name, $(ev.target).val());
        //console.log(this.model.attributes);
    },
    color_changed: function (ev) {
        this.model.set("color", $(ev.target).val());
        //console.log(this.model.attributes);
    }
});


function init() {
    console.log("init app and controls");
    $('#upload.btn').click(upload);
    $('button.upload-file').click(upload_file);
    $('button.upload-buffer').click(upload_buffer);
    $('#file-uploader').change(handle_image);
    init_canvas();
    var off = $('canvas').offset();
    console.log(off);
    $('body').css('background-position-x', off.left);
    $('body').css('background-position-y', off.top);
}

function init_canvas() {
    canvas = new fabric.StaticCanvas("canvas");
    canvas.setWidth(CANVAS_WIDTH);
    canvas.setHeight(CANVAS_HEIGHT);
    canvas.setBackgroundColor("#FFF");
    canvas.renderOnAddition = false;
}

function update_canvas(){
    //canvas.renderAll(false);
    $('body').css('background-image', 'url(' + canvas.toDataURL({format: "png", quality: 1}) + ')');
}

function upload() {
    $('#file-uploader').click();
}

function upload_file() {
    $('#file-uploader').click();
}

function upload_buffer() {
    $('.input-for-paste-link').slideToggle(ANIM_TIME);
}

function handle_image(e) {
    var reader = new FileReader();
    reader.onload = function (event) {
        var imgObj = new Image();
        imgObj.src = event.target.result;
        imgObj.onload = function () {
            parts.add({type: "img", img: imgObj});
            $('#source_chooser').modal('hide');
        };
        $(e.target).val("");
    };
    reader.readAsDataURL(e.target.files[0]);
}

function isInt(n) {
    return n % 1 === 0;
}

var parts = new SettingsCollection();
init();