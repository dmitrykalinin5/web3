<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    response.sendRedirect(request.getContextPath() + "/controller");
%>
<html>
<head>
    <script>
        // Автоматически отправляем POST запрос при загрузке страницы
        window.onload = function() {
            var form = document.createElement('form');
            form.method = 'POST';
            form.action = 'controller';
            document.body.appendChild(form);
            form.submit();
        };
    </script>
</head>
<body>
<!-- Показываем сообщение о загрузке -->
Перенаправление...
</body>
</html>