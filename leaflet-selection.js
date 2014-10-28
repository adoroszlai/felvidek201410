L.Mixin.Selectable = {
	includes: L.Mixin.Events,

	setSelected: function (s) {
		var selected = !!s;
		if (this._selected !== selected) {
			this._selected = selected;
			this.fire('selected');
		}
	},

	isSelected: function() {
		return !!this._selected;
	},
}

L.Mixin.Selection = {
	includes: L.Mixin.Events,

	getSelection: function() {
		return this._selected;
	},

	setSelection: function (item) {
		if (this._selected === item) {
			if (item !== null) {
				item.setSelected(!item.isSelected());
				if (!item.isSelected()) {
					this._selected = null;
				}
			}
		} else {
			if (this._selected) {
				this._selected.setSelected(false);
			}
			this._selected = item;
			if (this._selected) {
				this._selected.setSelected(true);
			}
		}
		this.fire('selectionChanged');
	},
}
