$(document).ready(function() {
    /**
     * 弹出显示提示信息
     * @param message
     * @param danger
     */
    var promptMsg = function(message, danger) {
        danger = (danger === true) ? 'alert-danger' : 'alert-success';
        $('<div>').appendTo('body').addClass('alert ' + danger).html(message).show().delay(1500).fadeOut();
    };



    /**
     * 点击内容区域显示添加、编辑、删除计划按钮
     */
    $('.plan-title').on('click', function(event) {
        event.stopPropagation();
        var self = $(this);
        var parentLi = self.parent().parent('li');
        var planItem = parentLi.children('.plan-item');
        var planTitle = planItem.children('.plan-title');
        var currentValue = parentLi.find('.plan-check').val().split('/').slice(-2, -1)[0];

        showOperation(planItem);
        editPlan(planTitle);
        planSave(planTitle);
        addPlan(currentValue, parentLi);
        removePlan(currentValue, parentLi);

        $('.plan-title-value').on('click', function(event) {
            event.stopPropagation();
        });
    });

    /**
     * 显示操作按钮（save、add、delete）
     */
    var showOperation = function(planItem) {
        var edit = ' <button class="plan-save btn btn-success btn-xs small">Save</button> ';
        var add = ' <button class="plan-add btn btn-primary btn-xs small">Add</button> ';
        var remove = ' <button class="plan-remove btn btn-danger btn-xs small">Delete</button>';

        $('.plan-list').find('.operation').remove();
        planItem.append('<div class="operation">' + edit + add + remove + '</div>');
    };

    /**
     * 点击其他区域隐藏操作按钮
     */
    $(document).on('click', function() {
        $(this).find('.operation').remove();
        resetTitleForm();
    });

    /**
     * 添加计划按钮
     * @param currentValue string 当前节点的值
     * @param parentLi object 上级<li>节点
     */
    var addPlan = function(currentValue, parentLi) {
        $('.plan-add').on('click', function(event) {
            event.stopPropagation();
            var form = '<input name="title[]" class="plan-add-value" data-parent="' + currentValue + '" value="" placeholder="Title"/>';
            var childUl = parentLi.children('ul');

            var node = '';
            if (childUl.length > 0) {
                node = '<li>' + form + '</li>';
                childUl.prepend(node);
            } else {
                node = '<ul><li>' + form + '</li></ul>';
                parentLi.append(node);
            }

            $('.submit-add').removeClass('hidden');
        });
    };

    /**
     * 保存新增的计划
     */
    var hasSubmit = false;
    $('.submit-add-plan').on('click', function() {

        if (hasSubmit) return;
        hasSubmit = true;

        var parentIds = [], titles = [];

        $(".plan-add-value").each(function() {
            var parentId = $(this).data('parent'),
                title = $(this).val();

            if (parentId && title) {
                parentIds.push(parentId);
                titles.push(title);
            }
        });

        $.post(
            $(this).data('url'),
            {parent_ids: parentIds, titles: titles},
            function(result) {
                if (result.status) {
                    promptMsg('Success.');
                    setTimeout(function() {
                        window.location.reload();
                    }, 1500)
                } else {
                    promptMsg('Failed.', true);
                }
            },
            'json'
        ).fail(function() { promptMsg('Failed.', true); });
    });


    /**
     * 删除计划
     * @param currentValue
     * @param parentLi object 上级<li>节点
     */
    var removePlan = function(currentValue, parentLi) {
        $('.plan-remove').on('click', function() {
            var childUl = parentLi.children('ul');
            var message = childUl.length > 0 ? 'Delete this item and its children?' : 'Delete?';
            var yes = confirm(message);

            if (yes) {
                $.get(
                    '/plan_delete/' + currentValue,
                    function(result) {
                        if (result.status) {
                            promptMsg('Success.');
                            parentLi.remove();
                        } else {
                            promptMsg('Failed.', true);
                        }
                    },
                    'json'
                ).fail(function() { promptMsg('Failed.', true); });
            }
        });
    };


    /**
     * 勾选或取消计划
     */
    $('.plan-check').on('click', function() {
        var self = $(this);
        var url = self.val();
        var checked = self.is(':checked');
        var finish = Number(checked);

        $.get(
            url + finish,
            function(result) {
                if (Number(result.finish) === 1 && checked === false) {
                    self.prop('checked', true)
                }
                if (Number(result.finish) === 0 && checked === true) {
                    self.prop('checked', false)
                }
            },
            'json'
        )
    });

    /**
     * 显示编辑form
     * @param planTitle .plan-title对象
     */
    var editPlan = function(planTitle) {
        var value= planTitle.html();
        var input = $('<input name="title" class="plan-title-value" value="' + value + '" />');

        resetTitleForm();
        planTitle.hide();
        planTitle.before(input);
    };

    /**
     * 保存编辑内容
     */
    var planSave = function(planTitle) {
        $('.plan-save').on('click', function(event) {
            event.stopPropagation();

            var url = planTitle.data('url');
            var value = planTitle.prev('.plan-title-value').val();

            if (value == planTitle.html()) {
                promptMsg('Nothing to save.', true);
                return;
            }

            $.post(
                url,
                {title: value},
                function (result) {
                    if (result.status) {
                        promptMsg('Success.');
                        planTitle.html(value);
                        resetTitleForm();
                    } else {
                        promptMsg('Failed.', true);
                    }
                },
                'json'
            ).fail(function() { promptMsg('Failed.', true); });
        });
    };


    /**
     * 重置编辑输入框
     */
    var resetTitleForm = function() {
        $('.plan-title').show();
        $('.plan-title-value').remove();
    }
});
