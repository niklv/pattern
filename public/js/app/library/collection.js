var Libraries = Backbone.Collection.extend({
    model: Library,
    initialize: function () {
        this.on("add", this.add_library);
        this.add({
            name: "Sample 1",
            id_name: "sample_1",
            sprite_path: "/img/samples/sample_1",
            sprite_ext: ".sprite.png"
        }, {total: 100,
            width: 13,
            height: 8,
            item_width: 300,
            item_height: 300});
        this.initUI();
    },
    initUI: function () {
        $("#sample-collections-tabs").find(".dropdown-menu a:last").tab('show');
    }
});