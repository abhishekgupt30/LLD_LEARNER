class AppException(Exception):
    """Base class for application-specific exceptions."""


class ProblemNotFound(AppException): pass
class UserNotFound(AppException): pass
class AttemptNotFound(AppException): pass
class SubmissionNotFound(AppException): pass
class EvaluationNotFound(AppException): pass
class InvalidAttemptState(AppException): pass
class SubmissionAlreadyExists(AppException): pass
class EvaluationFailed(AppException): pass
class InvalidSubmission(AppException): pass
class LLMRateLimitExceeded(AppException): pass
