<?php
require_once $_SERVER["DOCUMENT_ROOT"] . "/functions/core.php";

$user = Auth::requireAuth();

deleteOneDayByDate(getNextDayDate()); ?>
<div class="info">
    <span class="fav fav--info"></span>
    Расписание было спрошено, теперь нужно снова загрузить расписание для учителей, и для учеников
</div>
<script>
    document.location.href = "/dashboard/app/";
</script>